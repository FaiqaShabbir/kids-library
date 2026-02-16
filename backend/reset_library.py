"""
Reset the library and import only your real PDFs from storage/pdfs/
"""
import os
from app.database import SessionLocal, engine, Base
from app.models import Story, User, Favorite, Rating
from app.auth import get_password_hash

Base.metadata.create_all(bind=engine)

STORAGE_FOLDER = "storage/pdfs"

THEME_KEYWORDS = {
    "adventure": ["adventure", "journey", "quest", "explore", "brave"],
    "fantasy": ["magic", "wizard", "dragon", "fairy", "enchant", "spell", "pencil"],
    "animals": ["animal", "lion", "bear", "cat", "dog", "rabbit", "bunny", "tiger", "elephant", "roar", "paw", "leo"],
    "friendship": ["friend", "together", "share", "help", "kind"],
    "nature": ["garden", "tree", "forest", "flower", "nature", "plant"],
    "space": ["space", "star", "moon", "rocket", "planet", "astronaut"],
    "fairy-tales": ["princess", "prince", "castle", "kingdom", "queen", "king"],
    "bedtime": ["sleep", "dream", "night", "bed", "sleepy", "goodnight", "cloud"]
}


def detect_theme(title: str) -> str:
    title_lower = title.lower()
    for theme, keywords in THEME_KEYWORDS.items():
        for keyword in keywords:
            if keyword in title_lower:
                return theme
    return "adventure"


def detect_age_group(title: str) -> str:
    title_lower = title.lower()
    if any(word in title_lower for word in ["little", "baby", "tiny", "small"]):
        return "3-5"
    if any(word in title_lower for word in ["mystery", "secret", "quest"]):
        return "9-12"
    return "6-8"


def count_pdf_pages(pdf_path: str) -> int:
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(pdf_path)
        return len(reader.pages)
    except:
        return 10


def reset_and_import():
    print("\n" + "="*50)
    print("   RESETTING LIBRARY")
    print("="*50 + "\n")
    
    db = SessionLocal()
    
    # Clear all stories
    count = db.query(Story).count()
    db.query(Favorite).delete()
    db.query(Rating).delete()
    db.query(Story).delete()
    db.commit()
    print(f"Cleared {count} old stories")
    
    # Find real PDFs (not the auto-generated ones with timestamps)
    pdf_files = []
    if os.path.exists(STORAGE_FOLDER):
        for file in os.listdir(STORAGE_FOLDER):
            if file.lower().endswith('.pdf'):
                # Skip files with timestamps in name
                if "_2026" not in file and "20260" not in file:
                    pdf_files.append(os.path.join(STORAGE_FOLDER, file))
    
    print(f"\nFound {len(pdf_files)} PDF(s) to import:\n")
    
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        title = os.path.splitext(filename)[0]
        
        theme = detect_theme(title)
        age_group = detect_age_group(title)
        page_count = count_pdf_pages(pdf_path)
        
        story = Story(
            title=title,
            author="StoryLand",
            description=f"A wonderful {theme} story for children ages {age_group}.",
            pdf_url=pdf_path,
            page_count=page_count,
            age_group=age_group,
            theme=theme,
            is_premium=False,
            is_featured=True,
            cover_image_url=f"/storage/covers/{theme}.jpg"
        )
        db.add(story)
        db.commit()
        
        print(f"  + {title}")
        print(f"    Theme: {theme} | Age: {age_group} | Pages: {page_count}\n")
    
    # Ensure demo user exists
    if not db.query(User).filter(User.email == "demo@storyland.com").first():
        demo_user = User(
            email="demo@storyland.com",
            hashed_password=get_password_hash("demo123"),
            full_name="Demo User",
            is_subscribed=True,
            subscription_tier="premium"
        )
        db.add(demo_user)
        db.commit()
        print("Created demo user: demo@storyland.com / demo123")
    
    print("\n" + "="*50)
    print(f"   LIBRARY NOW HAS {len(pdf_files)} STORIES")
    print("="*50)
    
    db.close()


if __name__ == "__main__":
    reset_and_import()

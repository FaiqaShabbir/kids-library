"""
Automatically import all PDFs from the storage folder into the library.

Just drop your PDFs into: backend/storage/
Then run: python import_pdfs.py

The script will:
1. Scan the storage folder for PDFs
2. Skip any already imported
3. Add new ones to the database
"""
import os
import sys
from datetime import datetime
from app.database import SessionLocal, engine, Base
from app.models import Story

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Storage folder for PDFs
STORAGE_FOLDER = "storage"

# Available themes (will try to detect from filename)
THEME_KEYWORDS = {
    "adventure": ["adventure", "journey", "quest", "explore", "brave"],
    "fantasy": ["magic", "wizard", "dragon", "fairy", "enchant", "spell"],
    "animals": ["animal", "lion", "bear", "cat", "dog", "rabbit", "bunny", "tiger", "elephant", "roar", "paw"],
    "friendship": ["friend", "together", "share", "help", "kind"],
    "nature": ["garden", "tree", "forest", "flower", "nature", "plant"],
    "space": ["space", "star", "moon", "rocket", "planet", "astronaut"],
    "fairy-tales": ["princess", "prince", "castle", "kingdom", "queen", "king"],
    "bedtime": ["sleep", "dream", "night", "bed", "moon", "sleepy", "goodnight"]
}

# Age group detection keywords
AGE_KEYWORDS = {
    "3-5": ["little", "baby", "tiny", "small", "first"],
    "9-12": ["adventure", "mystery", "secret", "quest", "journey"],
}


def detect_theme(title: str) -> str:
    """Try to detect theme from title."""
    title_lower = title.lower()
    for theme, keywords in THEME_KEYWORDS.items():
        for keyword in keywords:
            if keyword in title_lower:
                return theme
    return "adventure"  # default


def detect_age_group(title: str) -> str:
    """Try to detect age group from title."""
    title_lower = title.lower()
    for age, keywords in AGE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in title_lower:
                return age
    return "6-8"  # default


def count_pdf_pages(pdf_path: str) -> int:
    """Count PDF pages."""
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(pdf_path)
        return len(reader.pages)
    except Exception:
        return 10


def get_existing_pdfs(db) -> set:
    """Get set of already imported PDF filenames."""
    stories = db.query(Story).all()
    existing = set()
    for story in stories:
        if story.pdf_url:
            # Get just the filename
            filename = os.path.basename(story.pdf_url)
            existing.add(filename.lower())
            # Also add original-ish name
            existing.add(story.pdf_url.lower())
    return existing


def import_pdfs():
    """Scan storage folder and import new PDFs."""
    print("\n" + "="*50)
    print("   IMPORTING PDFs FROM STORAGE")
    print("="*50 + "\n")
    
    # Ensure storage folder exists
    os.makedirs(STORAGE_FOLDER, exist_ok=True)
    os.makedirs(os.path.join(STORAGE_FOLDER, "pdfs"), exist_ok=True)
    
    db = SessionLocal()
    
    try:
        # Get already imported PDFs
        existing = get_existing_pdfs(db)
        
        # Find all PDFs in storage folder (including subdirectories)
        pdf_files = []
        for root, dirs, files in os.walk(STORAGE_FOLDER):
            for file in files:
                if file.lower().endswith('.pdf'):
                    full_path = os.path.join(root, file)
                    pdf_files.append(full_path)
        
        if not pdf_files:
            print("No PDF files found in storage folder.")
            print(f"Drop your PDFs into: {os.path.abspath(STORAGE_FOLDER)}")
            return
        
        print(f"Found {len(pdf_files)} PDF file(s)\n")
        
        imported = 0
        skipped = 0
        
        for pdf_path in pdf_files:
            filename = os.path.basename(pdf_path)
            
            # Check if already imported
            if filename.lower() in existing or pdf_path.lower() in existing:
                print(f"  [SKIP] {filename} (already imported)")
                skipped += 1
                continue
            
            # Extract title from filename
            title = os.path.splitext(filename)[0]
            # Clean up title (replace underscores with spaces)
            title = title.replace("_", " ").replace("-", " ")
            
            # Detect theme and age group
            theme = detect_theme(title)
            age_group = detect_age_group(title)
            
            # Count pages
            page_count = count_pdf_pages(pdf_path)
            
            # Create story entry
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
            
            print(f"  [ADD] {title}")
            print(f"        Theme: {theme}, Age: {age_group}, Pages: {page_count}")
            
            imported += 1
            existing.add(filename.lower())
        
        print("\n" + "-"*50)
        print(f"Imported: {imported} | Skipped: {skipped}")
        print("-"*50)
        
        if imported > 0:
            print("\nNew stories are now available in your library!")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


def list_stories():
    """List all stories in the database."""
    db = SessionLocal()
    stories = db.query(Story).order_by(Story.id).all()
    
    print("\n" + "="*50)
    print("   ALL STORIES IN LIBRARY")
    print("="*50 + "\n")
    
    for story in stories:
        premium = "[PREMIUM]" if story.is_premium else ""
        featured = "[FEATURED]" if story.is_featured else ""
        print(f"  {story.id}. {story.title} {premium}{featured}")
        print(f"     Theme: {story.theme} | Age: {story.age_group} | Pages: {story.page_count}")
    
    print(f"\nTotal: {len(stories)} stories")
    db.close()


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--list":
        list_stories()
    else:
        import_pdfs()
        print("\n")
        list_stories()

"""
Manage stories in the Kids Library database.

Usage:
    python manage_stories.py list          - List all stories
    python manage_stories.py delete <id>   - Delete a story by ID
    python manage_stories.py cleanup       - Remove duplicate stories
    python manage_stories.py import        - Import PDFs from storage folder
"""
import os
import sys
from app.database import SessionLocal, engine, Base
from app.models import Story

Base.metadata.create_all(bind=engine)

STORAGE_FOLDER = "storage"

THEME_KEYWORDS = {
    "adventure": ["adventure", "journey", "quest", "explore", "brave", "treasure", "pirate"],
    "fantasy": ["magic", "wizard", "dragon", "fairy", "enchant", "spell", "pencil", "wand", "potion"],
    "animals": ["animal", "lion", "bear", "cat", "dog", "rabbit", "bunny", "tiger", "elephant", "roar", "paw", "leo", "owl", "fox", "wolf"],
    "friendship": ["friend", "together", "share", "help", "kind", "team"],
    "nature": ["garden", "tree", "forest", "flower", "nature", "plant", "butterfly", "bee"],
    "space": ["space", "star", "moon", "rocket", "planet", "astronaut", "alien", "galaxy"],
    "fairy-tales": ["princess", "prince", "castle", "kingdom", "queen", "king", "knight"],
    "bedtime": ["sleep", "dream", "night", "bed", "sleepy", "goodnight", "cloud", "lullaby"]
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
    if any(word in title_lower for word in ["adventure", "mystery", "secret", "quest"]):
        return "9-12"
    return "6-8"


def count_pdf_pages(pdf_path: str) -> int:
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(pdf_path)
        return len(reader.pages)
    except:
        return 10


def list_stories():
    """List all stories."""
    db = SessionLocal()
    stories = db.query(Story).order_by(Story.id).all()
    
    print("\n" + "="*60)
    print("   ALL STORIES IN LIBRARY")
    print("="*60 + "\n")
    
    for story in stories:
        tags = []
        if story.is_premium:
            tags.append("PREMIUM")
        if story.is_featured:
            tags.append("FEATURED")
        tag_str = f" [{', '.join(tags)}]" if tags else ""
        
        print(f"  {story.id:3}. {story.title}{tag_str}")
        print(f"       Theme: {story.theme} | Age: {story.age_group} | Pages: {story.page_count}")
        if story.pdf_url:
            print(f"       PDF: {story.pdf_url}")
    
    print(f"\n  Total: {len(stories)} stories")
    db.close()


def delete_story(story_id: int):
    """Delete a story by ID."""
    db = SessionLocal()
    story = db.query(Story).filter(Story.id == story_id).first()
    
    if not story:
        print(f"Story with ID {story_id} not found.")
        return
    
    print(f"Deleting: {story.title}")
    db.delete(story)
    db.commit()
    print("Deleted!")
    db.close()


def cleanup_duplicates():
    """Remove duplicate stories (keep the first one)."""
    db = SessionLocal()
    stories = db.query(Story).order_by(Story.id).all()
    
    seen_titles = {}
    duplicates = []
    
    for story in stories:
        # Normalize title for comparison
        normalized = story.title.lower().strip()
        # Remove timestamps from title
        for sep in ["_2026", " 2026"]:
            if sep in normalized:
                normalized = normalized.split(sep)[0]
        
        if normalized in seen_titles:
            duplicates.append(story)
            print(f"  Duplicate found: ID {story.id} - {story.title}")
        else:
            seen_titles[normalized] = story.id
    
    if not duplicates:
        print("No duplicates found!")
        db.close()
        return
    
    print(f"\nFound {len(duplicates)} duplicate(s)")
    confirm = input("Delete duplicates? (y/n): ").strip().lower()
    
    if confirm == 'y':
        for story in duplicates:
            db.delete(story)
        db.commit()
        print(f"Deleted {len(duplicates)} duplicate(s)")
    else:
        print("Cancelled")
    
    db.close()


def generate_cover_for_story(story):
    """Generate a cover image for a story using PIL."""
    try:
        from generate_covers_local import generate_cover as gen_cover
        from app.database import SessionLocal
        db = SessionLocal()
        try:
            gen_cover(db, story.id, force=True)
        finally:
            db.close()
    except Exception as e:
        print(f"        Cover generation failed: {e}")


def import_pdfs():
    """Import new PDFs from storage folder."""
    print("\n" + "="*50)
    print("   IMPORTING PDFs FROM STORAGE")
    print("="*50 + "\n")
    
    os.makedirs(STORAGE_FOLDER, exist_ok=True)
    
    db = SessionLocal()
    
    try:
        # Get existing story titles (normalized)
        existing_titles = set()
        for story in db.query(Story).all():
            normalized = story.title.lower().strip()
            for sep in ["_2026", " 2026"]:
                if sep in normalized:
                    normalized = normalized.split(sep)[0]
            existing_titles.add(normalized)
        
        # Find PDFs
        pdf_files = []
        for root, dirs, files in os.walk(STORAGE_FOLDER):
            for file in files:
                if file.lower().endswith('.pdf'):
                    # Skip files in pdfs subfolder that have timestamps
                    if "_2026" in file:
                        continue
                    pdf_files.append(os.path.join(root, file))
        
        if not pdf_files:
            print("No new PDF files found.")
            print(f"\nDrop your PDFs into: {os.path.abspath(STORAGE_FOLDER)}")
            return
        
        print(f"Found {len(pdf_files)} PDF file(s)\n")
        
        imported = 0
        skipped = 0
        new_stories = []
        
        for pdf_path in pdf_files:
            filename = os.path.basename(pdf_path)
            title = os.path.splitext(filename)[0]
            title_clean = title.replace("_", " ").replace("-", " ").strip()
            
            # Check if already exists
            normalized = title_clean.lower()
            if normalized in existing_titles:
                print(f"  [SKIP] {title_clean} (already exists)")
                skipped += 1
                continue
            
            # Detect metadata
            theme = detect_theme(title_clean)
            age_group = detect_age_group(title_clean)
            page_count = count_pdf_pages(pdf_path)
            
            # Add to database
            story = Story(
                title=title_clean,
                author="StoryLand",
                description=f"A wonderful {theme} story for children ages {age_group}.",
                pdf_url=pdf_path,
                page_count=page_count,
                age_group=age_group,
                theme=theme,
                is_premium=False,
                is_featured=True,
            )
            db.add(story)
            db.commit()
            db.refresh(story)
            
            print(f"  [ADD] {title_clean}")
            print(f"        Theme: {theme} | Age: {age_group} | Pages: {page_count}")
            
            new_stories.append(story)
            imported += 1
            existing_titles.add(normalized)
        
        # Generate covers for new stories
        if new_stories:
            print("\n  Generating cover images...")
            for story in new_stories:
                generate_cover_for_story(story)
        
        print("\n" + "-"*50)
        print(f"  Imported: {imported} | Skipped: {skipped}")
        print("-"*50)
        
    finally:
        db.close()


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    
    command = sys.argv[1].lower()
    
    if command == "list":
        list_stories()
    elif command == "delete":
        if len(sys.argv) < 3:
            print("Usage: python manage_stories.py delete <id>")
            return
        delete_story(int(sys.argv[2]))
    elif command == "cleanup":
        cleanup_duplicates()
    elif command == "import":
        import_pdfs()
        list_stories()
    else:
        print(f"Unknown command: {command}")
        print(__doc__)


if __name__ == "__main__":
    main()

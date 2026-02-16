"""
Script to add cover images to stories.

Usage:
    python add_cover.py                    # Interactive mode
    python add_cover.py list               # List all stories
    python add_cover.py add <story_id> <image_path>  # Add cover to story
    python add_cover.py scan               # Auto-scan for matching covers
"""

import os
import sys
import shutil
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models

# Ensure storage directory exists
COVERS_DIR = os.path.join(os.path.dirname(__file__), "storage", "covers")
os.makedirs(COVERS_DIR, exist_ok=True)


def list_stories(db: Session):
    """List all stories with their cover status"""
    stories = db.query(models.Story).all()
    
    print("\n" + "=" * 70)
    print("STORY LIBRARY - Cover Image Status")
    print("=" * 70)
    
    for story in stories:
        has_cover = "YES" if story.cover_image_url and os.path.exists(story.cover_image_url) else "NO"
        cover_icon = "[*]" if has_cover == "YES" else "[ ]"
        print(f"\n{cover_icon} ID: {story.id} | {story.title}")
        print(f"    Theme: {story.theme or 'N/A'} | Age: {story.age_group or 'N/A'}")
        if story.cover_image_url:
            print(f"    Cover: {story.cover_image_url}")
    
    print("\n" + "=" * 70)
    print(f"Total: {len(stories)} stories | [*] = has cover, [ ] = no cover")
    print("=" * 70 + "\n")


def add_cover(db: Session, story_id: int, image_path: str):
    """Add a cover image to a story"""
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        print(f"Error: Story with ID {story_id} not found.")
        return False
    
    if not os.path.exists(image_path):
        print(f"Error: Image file not found: {image_path}")
        return False
    
    # Get file extension
    ext = os.path.splitext(image_path)[1].lower()
    if ext not in ['.png', '.jpg', '.jpeg', '.gif', '.webp']:
        print(f"Error: Unsupported image format. Use PNG, JPG, GIF, or WEBP.")
        return False
    
    # Create safe filename based on story title
    safe_title = "".join(c if c.isalnum() or c in " -_" else "_" for c in story.title)
    safe_title = safe_title.replace(" ", "_").lower()
    cover_filename = f"{story.id}_{safe_title}{ext}"
    cover_path = os.path.join(COVERS_DIR, cover_filename)
    
    # Copy image to covers directory
    shutil.copy2(image_path, cover_path)
    
    # Update story in database
    story.cover_image_url = cover_path
    db.commit()
    
    print(f"SUCCESS: Added cover for '{story.title}'")
    print(f"         Saved to: {cover_path}")
    return True


def scan_for_covers(db: Session):
    """Scan storage folder for images matching story titles"""
    stories = db.query(models.Story).all()
    storage_dir = os.path.join(os.path.dirname(__file__), "storage")
    
    print("\nScanning for cover images...")
    found_count = 0
    
    for story in stories:
        # Skip if already has cover
        if story.cover_image_url and os.path.exists(story.cover_image_url):
            continue
        
        # Create search patterns from title
        safe_title = story.title.lower().replace("'", "").replace("'", "")
        search_terms = [
            safe_title,
            safe_title.replace(" ", "_"),
            safe_title.replace(" ", "-"),
            safe_title.replace(" ", ""),
        ]
        
        # Search for matching images
        for root, dirs, files in os.walk(storage_dir):
            for file in files:
                file_lower = file.lower()
                ext = os.path.splitext(file_lower)[1]
                
                if ext not in ['.png', '.jpg', '.jpeg', '.gif', '.webp']:
                    continue
                
                # Check if filename matches story title
                file_name = os.path.splitext(file_lower)[0]
                for term in search_terms:
                    if term in file_name or file_name in term:
                        image_path = os.path.join(root, file)
                        print(f"\nFound potential match for '{story.title}':")
                        print(f"  Image: {image_path}")
                        
                        response = input("  Add this cover? (y/n): ").strip().lower()
                        if response == 'y':
                            if add_cover(db, story.id, image_path):
                                found_count += 1
                        break
    
    print(f"\nScan complete. Added {found_count} covers.")


def interactive_mode(db: Session):
    """Interactive mode for adding covers"""
    while True:
        print("\n" + "=" * 50)
        print("COVER IMAGE MANAGER")
        print("=" * 50)
        print("1. List all stories")
        print("2. Add cover to a story")
        print("3. Scan for matching covers")
        print("4. Exit")
        print("-" * 50)
        
        choice = input("Select option (1-4): ").strip()
        
        if choice == "1":
            list_stories(db)
        
        elif choice == "2":
            list_stories(db)
            story_id = input("\nEnter story ID: ").strip()
            if not story_id.isdigit():
                print("Invalid story ID")
                continue
            
            image_path = input("Enter image path: ").strip().strip('"').strip("'")
            add_cover(db, int(story_id), image_path)
        
        elif choice == "3":
            scan_for_covers(db)
        
        elif choice == "4":
            print("Goodbye!")
            break
        
        else:
            print("Invalid option")


def main():
    """Main entry point"""
    db = SessionLocal()
    
    try:
        if len(sys.argv) < 2:
            interactive_mode(db)
        elif sys.argv[1] == "list":
            list_stories(db)
        elif sys.argv[1] == "add" and len(sys.argv) >= 4:
            story_id = int(sys.argv[2])
            image_path = sys.argv[3]
            add_cover(db, story_id, image_path)
        elif sys.argv[1] == "scan":
            scan_for_covers(db)
        else:
            print(__doc__)
    finally:
        db.close()


if __name__ == "__main__":
    main()

"""
Add your own PDF story books to the library.

Usage:
    python add_story.py "D:\path\to\story.pdf" --title "Story Title" --age "6-8" --theme "adventure"

Or run interactively:
    python add_story.py
"""
import os
import sys
import shutil
import argparse
from datetime import datetime
from app.database import SessionLocal, engine, Base
from app.models import Story

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Available themes
THEMES = [
    "adventure",
    "fantasy", 
    "animals",
    "friendship",
    "nature",
    "space",
    "fairy-tales",
    "bedtime"
]

# Available age groups
AGE_GROUPS = ["3-5", "6-8", "9-12"]


def copy_pdf_to_storage(source_path: str) -> str:
    """Copy PDF to storage folder and return new path."""
    storage_dir = "storage/pdfs"
    os.makedirs(storage_dir, exist_ok=True)
    
    # Get filename and create unique name
    original_name = os.path.basename(source_path)
    name_without_ext = os.path.splitext(original_name)[0]
    
    # Clean the filename
    safe_name = "".join(c if c.isalnum() or c in " -_" else "_" for c in name_without_ext)
    safe_name = safe_name.replace(" ", "_")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    new_filename = f"{safe_name}_{timestamp}.pdf"
    dest_path = os.path.join(storage_dir, new_filename)
    
    # Copy the file
    shutil.copy2(source_path, dest_path)
    print(f"  Copied PDF to: {dest_path}")
    
    return dest_path


def count_pdf_pages(pdf_path: str) -> int:
    """Try to count PDF pages (returns default if library not available)."""
    try:
        # Try using PyPDF2 if available
        from PyPDF2 import PdfReader
        reader = PdfReader(pdf_path)
        return len(reader.pages)
    except ImportError:
        # Default page count if PyPDF2 not installed
        return 10
    except Exception:
        return 10


def add_story(
    pdf_path: str,
    title: str,
    description: str = "",
    age_group: str = "6-8",
    theme: str = "adventure",
    is_premium: bool = False,
    is_featured: bool = False,
    author: str = "StoryLand"
):
    """Add a story PDF to the database."""
    
    if not os.path.exists(pdf_path):
        print(f"Error: File not found: {pdf_path}")
        return False
    
    # Copy PDF to storage
    stored_path = copy_pdf_to_storage(pdf_path)
    
    # Count pages
    page_count = count_pdf_pages(pdf_path)
    
    # Create database entry
    db = SessionLocal()
    
    try:
        story = Story(
            title=title,
            author=author,
            description=description or f"A wonderful story for children ages {age_group}.",
            pdf_url=stored_path,
            page_count=page_count,
            age_group=age_group,
            theme=theme,
            is_premium=is_premium,
            is_featured=is_featured,
            cover_image_url=f"/storage/covers/{theme}.jpg"
        )
        db.add(story)
        db.commit()
        
        print(f"\n  Story added successfully!")
        print(f"  ID: {story.id}")
        print(f"  Title: {story.title}")
        print(f"  Pages: {page_count}")
        print(f"  Theme: {theme}")
        print(f"  Age Group: {age_group}")
        
        return True
        
    except Exception as e:
        print(f"Error adding story: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def interactive_mode():
    """Interactive mode to add stories."""
    print("\n" + "="*50)
    print("   ADD STORY TO KIDS LIBRARY")
    print("="*50 + "\n")
    
    # Get PDF path
    pdf_path = input("PDF file path: ").strip().strip('"')
    
    if not os.path.exists(pdf_path):
        print(f"Error: File not found: {pdf_path}")
        return
    
    # Get title (default from filename)
    default_title = os.path.splitext(os.path.basename(pdf_path))[0]
    title = input(f"Title [{default_title}]: ").strip() or default_title
    
    # Get description
    description = input("Description (optional): ").strip()
    
    # Get age group
    print(f"\nAge groups: {', '.join(AGE_GROUPS)}")
    age_group = input("Age group [6-8]: ").strip() or "6-8"
    if age_group not in AGE_GROUPS:
        print(f"Invalid age group. Using '6-8'")
        age_group = "6-8"
    
    # Get theme
    print(f"\nThemes: {', '.join(THEMES)}")
    theme = input("Theme [adventure]: ").strip() or "adventure"
    if theme not in THEMES:
        print(f"Invalid theme. Using 'adventure'")
        theme = "adventure"
    
    # Premium?
    is_premium = input("Premium story? (y/n) [n]: ").strip().lower() == 'y'
    
    # Featured?
    is_featured = input("Featured story? (y/n) [n]: ").strip().lower() == 'y'
    
    # Author
    author = input("Author [StoryLand]: ").strip() or "StoryLand"
    
    # Confirm
    print("\n" + "-"*40)
    print(f"Title: {title}")
    print(f"Author: {author}")
    print(f"Age Group: {age_group}")
    print(f"Theme: {theme}")
    print(f"Premium: {is_premium}")
    print(f"Featured: {is_featured}")
    print("-"*40)
    
    confirm = input("\nAdd this story? (y/n): ").strip().lower()
    
    if confirm == 'y':
        add_story(
            pdf_path=pdf_path,
            title=title,
            description=description,
            age_group=age_group,
            theme=theme,
            is_premium=is_premium,
            is_featured=is_featured,
            author=author
        )
    else:
        print("Cancelled.")


def main():
    parser = argparse.ArgumentParser(description="Add PDF stories to Kids Library")
    parser.add_argument("pdf_path", nargs="?", help="Path to PDF file")
    parser.add_argument("--title", "-t", help="Story title")
    parser.add_argument("--description", "-d", default="", help="Story description")
    parser.add_argument("--age", "-a", default="6-8", choices=AGE_GROUPS, help="Age group")
    parser.add_argument("--theme", default="adventure", choices=THEMES, help="Story theme")
    parser.add_argument("--author", default="StoryLand", help="Author name")
    parser.add_argument("--premium", action="store_true", help="Mark as premium")
    parser.add_argument("--featured", action="store_true", help="Mark as featured")
    
    args = parser.parse_args()
    
    if args.pdf_path:
        # Command line mode
        title = args.title or os.path.splitext(os.path.basename(args.pdf_path))[0]
        add_story(
            pdf_path=args.pdf_path,
            title=title,
            description=args.description,
            age_group=args.age,
            theme=args.theme,
            is_premium=args.premium,
            is_featured=args.featured,
            author=args.author
        )
    else:
        # Interactive mode
        interactive_mode()


if __name__ == "__main__":
    main()

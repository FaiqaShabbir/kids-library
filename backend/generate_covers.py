"""
Script to automatically generate cover images for stories using free AI image services.

This uses Pollinations.ai - a free AI image generation service.

Usage:
    python generate_covers.py              # Generate covers for all stories without one
    python generate_covers.py <story_id>   # Generate cover for specific story
    python generate_covers.py --all        # Regenerate all covers
"""

import os
import sys
import requests
import urllib.parse
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models

# Ensure storage directory exists
COVERS_DIR = os.path.join(os.path.dirname(__file__), "storage", "covers")
os.makedirs(COVERS_DIR, exist_ok=True)

# Theme-specific prompts for better cover generation
THEME_PROMPTS = {
    "adventure": "exciting adventure scene, mountains, treasure, exploration",
    "fantasy": "magical fantasy world, wizards, dragons, enchanted forest, sparkles",
    "animals": "cute friendly animals, cartoon style, forest or farm setting",
    "friendship": "happy children playing together, friendship, colorful playground",
    "nature": "beautiful nature scene, flowers, trees, butterflies, sunshine",
    "space": "outer space, rockets, planets, stars, astronauts, cosmic",
    "fairy-tales": "fairy tale castle, princess, magical creatures, enchanted",
    "bedtime": "peaceful night scene, moon, stars, cozy bedroom, sleepy animals",
}

AGE_STYLES = {
    "3-5": "very cute, simple shapes, bright primary colors, cartoon style",
    "6-8": "colorful, detailed illustration, friendly characters, storybook style",
    "9-12": "detailed illustration, dynamic composition, adventure style",
}


def generate_prompt(story) -> str:
    """Generate an image prompt based on story details"""
    theme_extra = THEME_PROMPTS.get(story.theme, "magical storybook")
    age_style = AGE_STYLES.get(story.age_group, "children's book illustration")
    
    prompt = f"""
    Children's book cover illustration for "{story.title}".
    {theme_extra}.
    Style: {age_style}, vibrant colors, professional illustration, 
    whimsical, kid-friendly, high quality digital art, book cover design
    """.strip().replace("\n", " ")
    
    return prompt


def generate_cover(db: Session, story_id: int, force: bool = False) -> bool:
    """Generate a cover image for a story"""
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        print(f"Error: Story with ID {story_id} not found.")
        return False
    
    # Check if cover already exists
    if story.cover_image_url and os.path.exists(story.cover_image_url) and not force:
        print(f"Skipping '{story.title}' - already has cover")
        return False
    
    print(f"\nGenerating cover for: {story.title}")
    print(f"  Theme: {story.theme or 'N/A'}, Age: {story.age_group or 'N/A'}")
    
    # Generate a simple short prompt
    theme_words = {
        "adventure": "adventure mountain treasure",
        "fantasy": "magic wizard dragon",
        "animals": "cute animals forest",
        "friendship": "happy children playing",
        "nature": "flowers trees butterflies",
        "space": "space rockets planets",
        "fairy-tales": "castle princess fairy",
        "bedtime": "moon stars night",
    }
    theme_word = theme_words.get(story.theme, "storybook")
    
    # Use a simple prompt with just the title and theme
    simple_prompt = f"{story.title} {theme_word} children illustration colorful"
    encoded_prompt = urllib.parse.quote(simple_prompt)
    
    # Try multiple services in order
    services = [
        # Pollinations with simpler prompt
        f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=600&height=400&seed={story.id}&nologo=true",
        # Alternative: use picsum with seed for consistent images
    ]
    
    for service_url in services:
        try:
            print(f"  Trying: {service_url[:60]}...")
            response = requests.get(service_url, timeout=90)
            
            if response.status_code == 200:
                # Save image
                safe_title = "".join(c if c.isalnum() or c in " -_" else "_" for c in story.title)
                safe_title = safe_title.replace(" ", "_").lower()
                cover_filename = f"{story.id}_{safe_title}.png"
                cover_path = os.path.join(COVERS_DIR, cover_filename)
                
                with open(cover_path, 'wb') as f:
                    f.write(response.content)
                
                # Update database
                story.cover_image_url = cover_path
                db.commit()
                
                print(f"  SUCCESS: Saved to {cover_path}")
                return True
        except Exception as e:
            print(f"  Service failed: {e}")
            continue
    
    print(f"  ERROR: All services failed for '{story.title}'")
    return False


def generate_all_covers(db: Session, force: bool = False):
    """Generate covers for all stories"""
    stories = db.query(models.Story).all()
    
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for story in stories:
        if not force and story.cover_image_url and os.path.exists(story.cover_image_url):
            skip_count += 1
            continue
        
        if generate_cover(db, story.id, force):
            success_count += 1
        else:
            error_count += 1
    
    print("\n" + "=" * 50)
    print("GENERATION COMPLETE")
    print("=" * 50)
    print(f"  Generated: {success_count}")
    print(f"  Skipped: {skip_count}")
    print(f"  Errors: {error_count}")


def main():
    """Main entry point"""
    db = SessionLocal()
    
    try:
        if len(sys.argv) < 2:
            generate_all_covers(db)
        elif sys.argv[1] == "--all":
            generate_all_covers(db, force=True)
        elif sys.argv[1].isdigit():
            generate_cover(db, int(sys.argv[1]), force=True)
        else:
            print(__doc__)
    finally:
        db.close()


if __name__ == "__main__":
    main()

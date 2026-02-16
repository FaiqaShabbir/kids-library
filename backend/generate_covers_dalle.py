"""
Generate beautiful cover images for stories using OpenAI's DALL-E 3.

Usage:
    python generate_covers_dalle.py              # Generate covers for all stories without one
    python generate_covers_dalle.py <story_id>   # Generate cover for specific story
    python generate_covers_dalle.py --all        # Regenerate all covers
"""

import os
import sys
import requests
from openai import OpenAI
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.config import get_settings
from app import models

# Ensure storage directory exists
COVERS_DIR = os.path.join(os.path.dirname(__file__), "storage", "covers")
os.makedirs(COVERS_DIR, exist_ok=True)

# Initialize OpenAI client
settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

# Theme-specific style hints for better cover generation
THEME_STYLES = {
    "adventure": "exciting adventure scene with mountains, treasure maps, or exploration elements",
    "fantasy": "magical fantasy world with sparkles, enchanted elements, wizards or magical creatures",
    "animals": "adorable cartoon animals in a friendly forest or nature setting",
    "friendship": "happy diverse children playing together, warm and friendly atmosphere",
    "nature": "beautiful garden with colorful flowers, butterflies, and sunshine",
    "space": "cosmic adventure with rockets, planets, stars, and friendly astronauts",
    "fairy-tales": "enchanted castle, princesses, magical creatures in a storybook setting",
    "bedtime": "peaceful nighttime scene with moon, stars, cozy atmosphere, sleepy animals",
}

AGE_STYLES = {
    "3-5": "very cute, simple rounded shapes, bright primary colors, cartoon style suitable for toddlers",
    "6-8": "colorful detailed illustration, friendly characters, classic storybook style",
    "9-12": "more detailed and dynamic illustration, adventure style with depth",
}


def generate_prompt(story) -> str:
    """Generate an optimized DALL-E prompt for the story"""
    theme_hint = THEME_STYLES.get(story.theme, "magical storybook scene")
    age_style = AGE_STYLES.get(story.age_group, "children's book illustration style")
    
    prompt = f"""Create a beautiful children's book cover illustration for a story called "{story.title}".

Scene: {theme_hint}
Style: {age_style}

Requirements:
- Vibrant, eye-catching colors
- Professional children's book illustration quality
- Whimsical and kid-friendly
- No text or words in the image
- Suitable as a book cover with clear focal point
- Digital art style, high quality"""

    return prompt


def generate_cover(db: Session, story_id: int, force: bool = False) -> bool:
    """Generate a cover image for a story using DALL-E 3"""
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
    
    # Generate prompt
    prompt = generate_prompt(story)
    print(f"  Sending request to DALL-E 3...")
    
    try:
        # Generate image with DALL-E 3
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",  # DALL-E 3 supports 1024x1024, 1792x1024, or 1024x1792
            quality="standard",  # "standard" or "hd"
            n=1,
        )
        
        # Get image URL
        image_url = response.data[0].url
        print(f"  Image generated! Downloading...")
        
        # Download the image
        img_response = requests.get(image_url, timeout=60)
        img_response.raise_for_status()
        
        # Save image
        safe_title = "".join(c if c.isalnum() or c in " -_" else "_" for c in story.title)
        safe_title = safe_title.replace(" ", "_").lower()
        cover_filename = f"{story.id}_{safe_title}.png"
        cover_path = os.path.join(COVERS_DIR, cover_filename)
        
        with open(cover_path, 'wb') as f:
            f.write(img_response.content)
        
        # Update database
        story.cover_image_url = cover_path
        db.commit()
        
        print(f"  SUCCESS: Saved to {cover_path}")
        print(f"  Revised prompt: {response.data[0].revised_prompt[:100]}...")
        return True
        
    except Exception as e:
        print(f"  ERROR: Failed to generate image - {e}")
        return False


def generate_all_covers(db: Session, force: bool = False):
    """Generate covers for all stories"""
    stories = db.query(models.Story).all()
    
    if not stories:
        print("No stories found in database.")
        return
    
    success_count = 0
    skip_count = 0
    error_count = 0
    
    print(f"\nFound {len(stories)} stories in database")
    print("=" * 50)
    
    for story in stories:
        if not force and story.cover_image_url and os.path.exists(story.cover_image_url):
            print(f"[SKIP] {story.title} - already has cover")
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
    
    if success_count > 0:
        print(f"\nCovers saved to: {COVERS_DIR}")


def main():
    """Main entry point"""
    if not settings.openai_api_key:
        print("ERROR: OPENAI_API_KEY not set in .env file")
        print("Please add your OpenAI API key to the .env file")
        return
    
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

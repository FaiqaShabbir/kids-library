"""
Generate beautiful gradient cover images locally using PIL.

Usage:
    python generate_covers_local.py              # Generate covers for all stories
    python generate_covers_local.py <story_id>   # Generate cover for specific story
    python generate_covers_local.py --all        # Regenerate all covers
"""

import os
import sys
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models

# Ensure storage directory exists
COVERS_DIR = os.path.join(os.path.dirname(__file__), "storage", "covers")
os.makedirs(COVERS_DIR, exist_ok=True)

# Image dimensions
WIDTH = 600
HEIGHT = 400

# Theme colors (gradient start, gradient end, accent)
THEME_COLORS = {
    "adventure": [(255, 165, 0), (220, 20, 60), (255, 255, 255)],      # Orange to red
    "fantasy": [(147, 112, 219), (255, 20, 147), (255, 255, 255)],     # Purple to pink
    "animals": [(34, 139, 34), (32, 178, 170), (255, 255, 255)],       # Green to teal
    "friendship": [(255, 182, 193), (255, 105, 180), (255, 255, 255)], # Pink shades
    "nature": [(34, 139, 34), (144, 238, 144), (255, 255, 255)],       # Green shades
    "space": [(25, 25, 112), (75, 0, 130), (255, 255, 255)],           # Dark blue to indigo
    "fairy-tales": [(255, 182, 193), (186, 85, 211), (255, 255, 255)], # Pink to purple
    "bedtime": [(25, 25, 112), (70, 130, 180), (255, 255, 255)],       # Dark blue to steel blue
}

# Default colors
DEFAULT_COLORS = [(100, 149, 237), (147, 112, 219), (255, 255, 255)]


def create_gradient(width, height, start_color, end_color, angle=45):
    """Create a gradient image"""
    image = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(image)
    
    # Calculate gradient
    for y in range(height):
        for x in range(width):
            # Calculate position along gradient angle
            factor = (x + y) / (width + height)
            
            r = int(start_color[0] + (end_color[0] - start_color[0]) * factor)
            g = int(start_color[1] + (end_color[1] - start_color[1]) * factor)
            b = int(start_color[2] + (end_color[2] - start_color[2]) * factor)
            
            draw.point((x, y), fill=(r, g, b))
    
    return image


def add_decorations(image, theme):
    """Add decorative elements based on theme"""
    draw = ImageDraw.Draw(image, 'RGBA')
    
    # Add some semi-transparent circles for decoration
    random.seed(hash(theme))
    
    for _ in range(8):
        x = random.randint(0, WIDTH)
        y = random.randint(0, HEIGHT)
        radius = random.randint(20, 80)
        alpha = random.randint(20, 60)
        
        draw.ellipse(
            [x - radius, y - radius, x + radius, y + radius],
            fill=(255, 255, 255, alpha)
        )
    
    return image


def wrap_text(text, font, max_width, draw):
    """Wrap text to fit within max_width"""
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        width = bbox[2] - bbox[0]
        
        if width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    
    if current_line:
        lines.append(' '.join(current_line))
    
    return lines


def add_title(image, title, accent_color):
    """Add title text to the cover"""
    draw = ImageDraw.Draw(image)
    
    # Try to use a nice font, fall back to default
    font_size = 48
    try:
        # Try common Windows fonts
        font_paths = [
            "C:/Windows/Fonts/comicbd.ttf",  # Comic Sans Bold
            "C:/Windows/Fonts/comic.ttf",     # Comic Sans
            "C:/Windows/Fonts/segoeui.ttf",   # Segoe UI
            "C:/Windows/Fonts/arial.ttf",     # Arial
        ]
        font = None
        for path in font_paths:
            if os.path.exists(path):
                font = ImageFont.truetype(path, font_size)
                break
        if not font:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Wrap title text
    max_width = WIDTH - 80
    lines = wrap_text(title, font, max_width, draw)
    
    # Calculate total height
    line_height = font_size + 10
    total_height = len(lines) * line_height
    
    # Start position (centered)
    start_y = (HEIGHT - total_height) // 2
    
    # Draw text shadow
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x = (WIDTH - text_width) // 2
        y = start_y + i * line_height
        
        # Shadow
        draw.text((x + 3, y + 3), line, font=font, fill=(0, 0, 0, 128))
        # Main text
        draw.text((x, y), line, font=font, fill=accent_color)
    
    return image


def add_theme_badge(image, theme, age_group):
    """Add theme and age badge"""
    draw = ImageDraw.Draw(image)
    
    try:
        font_paths = [
            "C:/Windows/Fonts/segoeui.ttf",
            "C:/Windows/Fonts/arial.ttf",
        ]
        font = None
        for path in font_paths:
            if os.path.exists(path):
                font = ImageFont.truetype(path, 18)
                break
        if not font:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Theme badge (top left)
    if theme:
        theme_text = theme.replace("-", " ").title()
        bbox = draw.textbbox((0, 0), theme_text, font=font)
        text_width = bbox[2] - bbox[0]
        
        # Draw badge background
        padding = 10
        draw.rounded_rectangle(
            [20, 20, 20 + text_width + padding * 2, 50],
            radius=10,
            fill=(0, 0, 0, 100)
        )
        draw.text((20 + padding, 25), theme_text, font=font, fill=(255, 255, 255))
    
    # Age badge (top right)
    if age_group:
        age_text = f"Ages {age_group}"
        bbox = draw.textbbox((0, 0), age_text, font=font)
        text_width = bbox[2] - bbox[0]
        
        # Draw badge background
        padding = 10
        x = WIDTH - 20 - text_width - padding * 2
        draw.rounded_rectangle(
            [x, 20, WIDTH - 20, 50],
            radius=10,
            fill=(0, 0, 0, 100)
        )
        draw.text((x + padding, 25), age_text, font=font, fill=(255, 255, 255))
    
    return image


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
    
    # Get colors for theme
    colors = THEME_COLORS.get(story.theme, DEFAULT_COLORS)
    start_color, end_color, accent_color = colors
    
    # Create gradient background
    image = create_gradient(WIDTH, HEIGHT, start_color, end_color)
    
    # Convert to RGBA for transparency support
    image = image.convert('RGBA')
    
    # Add decorations
    image = add_decorations(image, story.theme or "default")
    
    # Add title
    image = add_title(image, story.title, accent_color)
    
    # Add theme/age badges
    image = add_theme_badge(image, story.theme, story.age_group)
    
    # Convert back to RGB for saving as PNG
    image = image.convert('RGB')
    
    # Save image
    safe_title = "".join(c if c.isalnum() or c in " -_" else "_" for c in story.title)
    safe_title = safe_title.replace(" ", "_").lower()
    cover_filename = f"{story.id}_{safe_title}.png"
    cover_path = os.path.join(COVERS_DIR, cover_filename)
    
    image.save(cover_path, 'PNG', quality=95)
    
    # Update database
    story.cover_image_url = cover_path
    db.commit()
    
    print(f"  SUCCESS: Saved to {cover_path}")
    return True


def generate_all_covers(db: Session, force: bool = False):
    """Generate covers for all stories"""
    stories = db.query(models.Story).all()
    
    success_count = 0
    skip_count = 0
    
    for story in stories:
        if not force and story.cover_image_url and os.path.exists(story.cover_image_url):
            skip_count += 1
            continue
        
        if generate_cover(db, story.id, force):
            success_count += 1
    
    print("\n" + "=" * 50)
    print("GENERATION COMPLETE")
    print("=" * 50)
    print(f"  Generated: {success_count}")
    print(f"  Skipped: {skip_count}")


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

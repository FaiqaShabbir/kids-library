"""
Upload all local PDFs and cover images to Cloudinary.

Run this before deploying to upload your files to the cloud.

Usage:
    python upload_to_cloud.py
    python upload_to_cloud.py --retry   # Retry failed uploads
"""

import os
import sys
import time
import cloudinary
import cloudinary.uploader
from app.database import SessionLocal
from app.models import Story
from app.config import get_settings

settings = get_settings()

# Configure Cloudinary
if settings.cloudinary_cloud_name:
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True
    )


def is_configured():
    return bool(settings.cloudinary_cloud_name and settings.cloudinary_api_key)


def upload_with_retry(file_path, resource_type, public_id, folder, max_retries=3):
    """Upload a file with retry logic"""
    for attempt in range(max_retries):
        try:
            result = cloudinary.uploader.upload(
                file_path,
                resource_type=resource_type,
                public_id=public_id,
                folder=folder,
                overwrite=True
            )
            return result.get("secure_url")
        except Exception as e:
            print(f"    Attempt {attempt + 1} failed: {str(e)[:50]}...")
            if attempt < max_retries - 1:
                wait = (attempt + 1) * 5
                print(f"    Retrying in {wait}s...")
                time.sleep(wait)
    return None


def upload_all_files():
    """Upload all local files to Cloudinary"""
    
    if not is_configured():
        print("ERROR: Cloudinary is not configured!")
        print("\nPlease add these to your .env file:")
        print("  CLOUDINARY_CLOUD_NAME=your_cloud_name")
        print("  CLOUDINARY_API_KEY=your_api_key")
        print("  CLOUDINARY_API_SECRET=your_api_secret")
        return
    
    db = SessionLocal()
    stories = db.query(Story).all()
    
    print(f"\nFound {len(stories)} stories to process")
    print("=" * 50)
    
    pdf_uploaded = 0
    cover_uploaded = 0
    errors = 0
    
    for story in stories:
        print(f"\n[{story.id}] {story.title}")
        changed = False
        
        # Upload cover if local
        if story.cover_image_url and not story.cover_image_url.startswith("http"):
            if os.path.exists(story.cover_image_url):
                print(f"  Uploading cover...")
                url = upload_with_retry(
                    story.cover_image_url,
                    "image",
                    f"story_{story.id}_cover",
                    "kids-library/covers"
                )
                if url:
                    story.cover_image_url = url
                    cover_uploaded += 1
                    changed = True
                    print(f"  -> Cover done!")
                else:
                    errors += 1
                    print(f"  -> Cover FAILED")
        else:
            print(f"  Cover: already in cloud")
        
        # Upload PDF if local
        if story.pdf_url and not story.pdf_url.startswith("http"):
            if os.path.exists(story.pdf_url):
                print(f"  Uploading PDF...")
                url = upload_with_retry(
                    story.pdf_url,
                    "raw",
                    f"story_{story.id}_pdf",
                    "kids-library/pdfs"
                )
                if url:
                    story.pdf_url = url
                    pdf_uploaded += 1
                    changed = True
                    print(f"  -> PDF done!")
                else:
                    errors += 1
                    print(f"  -> PDF FAILED")
        else:
            print(f"  PDF: already in cloud")
        
        # Commit after each story to save progress
        if changed:
            db.commit()
            print(f"  Saved to database!")
    
    db.close()
    
    print("\n" + "=" * 50)
    print("UPLOAD COMPLETE")
    print("=" * 50)
    print(f"  Covers uploaded: {cover_uploaded}")
    print(f"  PDFs uploaded: {pdf_uploaded}")
    print(f"  Errors: {errors}")
    
    if errors > 0:
        print("\nRun again to retry failed uploads:")
        print("  python upload_to_cloud.py")


if __name__ == "__main__":
    upload_all_files()

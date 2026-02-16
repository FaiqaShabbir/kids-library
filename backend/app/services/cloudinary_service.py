"""
Cloudinary service for storing PDFs and cover images in the cloud.
"""

import os
import cloudinary
import cloudinary.uploader
from app.config import get_settings

settings = get_settings()

# Configure Cloudinary if credentials are available
if settings.cloudinary_cloud_name:
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True
    )


def is_cloudinary_configured() -> bool:
    """Check if Cloudinary is configured"""
    return bool(settings.cloudinary_cloud_name and settings.cloudinary_api_key)


def upload_pdf(file_path: str, public_id: str = None) -> dict:
    """
    Upload a PDF to Cloudinary.
    Returns dict with 'url' and 'public_id'
    """
    if not is_cloudinary_configured():
        return {"url": file_path, "public_id": None, "local": True}
    
    result = cloudinary.uploader.upload(
        file_path,
        resource_type="raw",
        public_id=public_id,
        folder="kids-library/pdfs",
        overwrite=True
    )
    
    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
        "local": False
    }


def upload_cover_image(file_path: str, public_id: str = None) -> dict:
    """
    Upload a cover image to Cloudinary.
    Returns dict with 'url' and 'public_id'
    """
    if not is_cloudinary_configured():
        return {"url": file_path, "public_id": None, "local": True}
    
    result = cloudinary.uploader.upload(
        file_path,
        public_id=public_id,
        folder="kids-library/covers",
        overwrite=True,
        transformation=[
            {"width": 600, "height": 400, "crop": "fill"},
            {"quality": "auto"},
            {"fetch_format": "auto"}
        ]
    )
    
    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
        "local": False
    }


def delete_file(public_id: str, resource_type: str = "image") -> bool:
    """Delete a file from Cloudinary"""
    if not is_cloudinary_configured() or not public_id:
        return False
    
    try:
        cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        return True
    except Exception:
        return False


def get_pdf_url(story) -> str:
    """Get the URL for a story's PDF"""
    if not story.pdf_url:
        return None
    
    # If it's already a full URL (Cloudinary), return as-is
    if story.pdf_url.startswith("http"):
        return story.pdf_url
    
    # Local file - return the path (for local dev)
    return story.pdf_url


def get_cover_url(story) -> str:
    """Get the URL for a story's cover image"""
    if not story.cover_image_url:
        return None
    
    # If it's already a full URL (Cloudinary), return as-is
    if story.cover_image_url.startswith("http"):
        return story.cover_image_url
    
    # Local file - return the path (for local dev)
    return story.cover_image_url

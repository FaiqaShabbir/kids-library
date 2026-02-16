from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
import os
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user, get_premium_user
from app.services.ai_story_generator import generate_story_with_gemini
from app.services.pdf_generator import create_story_pdf

router = APIRouter()


def is_cloud_url(url: str) -> bool:
    """Check if URL is a cloud URL"""
    return url and url.startswith("http")


@router.get("/", response_model=schemas.StoryListResponse)
def get_stories(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    age_group: Optional[str] = None,
    theme: Optional[str] = None,
    featured_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get paginated list of stories"""
    query = db.query(models.Story)
    
    if age_group:
        query = query.filter(models.Story.age_group == age_group)
    if theme:
        query = query.filter(models.Story.theme == theme)
    if featured_only:
        query = query.filter(models.Story.is_featured == True)
    
    total = query.count()
    stories = query.order_by(models.Story.created_at.desc())\
        .offset((page - 1) * page_size)\
        .limit(page_size)\
        .all()
    
    # Calculate average ratings
    story_responses = []
    for story in stories:
        avg_rating = db.query(func.avg(models.Rating.rating))\
            .filter(models.Rating.story_id == story.id).scalar()
        story_dict = schemas.StoryResponse.model_validate(story)
        story_dict.average_rating = round(avg_rating, 1) if avg_rating else None
        story_responses.append(story_dict)
    
    return {
        "stories": story_responses,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/featured", response_model=List[schemas.StoryResponse])
def get_featured_stories(db: Session = Depends(get_db)):
    """Get featured stories for homepage"""
    stories = db.query(models.Story)\
        .filter(models.Story.is_featured == True)\
        .order_by(models.Story.created_at.desc())\
        .limit(6)\
        .all()
    return stories


@router.get("/themes")
def get_available_themes():
    """Get list of available story themes"""
    return {
        "themes": [
            {"id": "adventure", "name": "Adventure", "emoji": "🏔️"},
            {"id": "fantasy", "name": "Fantasy & Magic", "emoji": "🧙‍♂️"},
            {"id": "animals", "name": "Animals", "emoji": "🐾"},
            {"id": "friendship", "name": "Friendship", "emoji": "🤝"},
            {"id": "nature", "name": "Nature & Environment", "emoji": "🌳"},
            {"id": "space", "name": "Space & Science", "emoji": "🚀"},
            {"id": "fairy-tales", "name": "Fairy Tales", "emoji": "👸"},
            {"id": "bedtime", "name": "Bedtime Stories", "emoji": "🌙"},
        ],
        "age_groups": [
            {"id": "3-5", "name": "Ages 3-5"},
            {"id": "6-8", "name": "Ages 6-8"},
            {"id": "9-12", "name": "Ages 9-12"},
        ]
    }


@router.get("/{story_id}", response_model=schemas.StoryResponse)
def get_story(story_id: int, db: Session = Depends(get_db)):
    """Get a single story by ID"""
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    # Increment read count
    story.read_count += 1
    db.commit()
    
    # Get average rating
    avg_rating = db.query(func.avg(models.Rating.rating))\
        .filter(models.Rating.story_id == story.id).scalar()
    
    response = schemas.StoryResponse.model_validate(story)
    response.average_rating = round(avg_rating, 1) if avg_rating else None
    return response


@router.get("/{story_id}/view")
def view_story_pdf(
    story_id: int,
    db: Session = Depends(get_db)
):
    """View story PDF in browser (no login required for free stories)"""
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    if not story.pdf_url:
        raise HTTPException(status_code=404, detail="PDF not available")
    
    # Increment read count
    story.read_count += 1
    db.commit()
    
    # If cloud URL, redirect to it
    if is_cloud_url(story.pdf_url):
        return RedirectResponse(url=story.pdf_url)
    
    # Local file
    if not os.path.exists(story.pdf_url):
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return FileResponse(
        story.pdf_url,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"}
    )


@router.get("/{story_id}/download")
def download_story_pdf(
    story_id: int,
    db: Session = Depends(get_db)
):
    """Download story PDF"""
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    if not story.pdf_url:
        raise HTTPException(status_code=404, detail="PDF not available")
    
    # Safe filename
    safe_title = "".join(c if c.isalnum() or c in " -_" else "_" for c in story.title)
    
    # If cloud URL, redirect to it
    if is_cloud_url(story.pdf_url):
        return RedirectResponse(url=story.pdf_url)
    
    # Local file
    if not os.path.exists(story.pdf_url):
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return FileResponse(
        story.pdf_url,
        media_type="application/pdf",
        filename=f"{safe_title}.pdf",
        headers={"Content-Disposition": f"attachment; filename={safe_title}.pdf"}
    )


@router.get("/{story_id}/cover")
def get_story_cover(
    story_id: int,
    db: Session = Depends(get_db)
):
    """Get story cover image"""
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    if not story.cover_image_url:
        raise HTTPException(status_code=404, detail="Cover image not available")
    
    # If cloud URL, redirect to it
    if is_cloud_url(story.cover_image_url):
        return RedirectResponse(url=story.cover_image_url)
    
    # Local file
    if not os.path.exists(story.cover_image_url):
        raise HTTPException(status_code=404, detail="Cover image not found")
    
    # Determine media type based on extension
    ext = os.path.splitext(story.cover_image_url)[1].lower()
    media_types = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    }
    media_type = media_types.get(ext, 'image/png')
    
    return FileResponse(
        story.cover_image_url,
        media_type=media_type
    )


@router.post("/generate", response_model=schemas.StoryResponse)
async def generate_story(
    request: schemas.StoryGenerateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_premium_user)
):
    """Generate a new story using AI (premium feature)"""
    # Generate story content
    story_content = await generate_story_with_gemini(
        title=request.title,
        age_group=request.age_group,
        theme=request.theme,
        page_count=request.page_count
    )
    
    # Create PDF
    pdf_path = create_story_pdf(
        title=request.title,
        content=story_content,
        page_count=request.page_count
    )
    
    # Save to database
    new_story = models.Story(
        title=request.title,
        description=story_content[:200] + "...",
        pdf_url=pdf_path,
        page_count=request.page_count,
        age_group=request.age_group,
        theme=request.theme,
        is_premium=True
    )
    db.add(new_story)
    db.commit()
    db.refresh(new_story)
    
    return new_story


@router.post("/{story_id}/favorite")
def toggle_favorite(
    story_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Toggle story as favorite"""
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    existing = db.query(models.Favorite)\
        .filter(models.Favorite.user_id == current_user.id)\
        .filter(models.Favorite.story_id == story_id)\
        .first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Removed from favorites", "is_favorite": False}
    else:
        favorite = models.Favorite(user_id=current_user.id, story_id=story_id)
        db.add(favorite)
        db.commit()
        return {"message": "Added to favorites", "is_favorite": True}


@router.post("/{story_id}/rate", response_model=schemas.RatingResponse)
def rate_story(
    story_id: int,
    rating: schemas.RatingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Rate a story"""
    if rating.rating < 1 or rating.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    # Check if already rated
    existing = db.query(models.Rating)\
        .filter(models.Rating.user_id == current_user.id)\
        .filter(models.Rating.story_id == story_id)\
        .first()
    
    if existing:
        existing.rating = rating.rating
        existing.comment = rating.comment
        db.commit()
        db.refresh(existing)
        return existing
    
    new_rating = models.Rating(
        user_id=current_user.id,
        story_id=story_id,
        rating=rating.rating,
        comment=rating.comment
    )
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    return new_rating


@router.get("/{story_id}/ratings", response_model=List[schemas.RatingResponse])
def get_story_ratings(story_id: int, db: Session = Depends(get_db)):
    """Get all ratings for a story"""
    ratings = db.query(models.Rating)\
        .filter(models.Rating.story_id == story_id)\
        .order_by(models.Rating.created_at.desc())\
        .limit(20)\
        .all()
    
    response = []
    for r in ratings:
        rating_dict = schemas.RatingResponse.model_validate(r)
        rating_dict.user_name = r.user.full_name or "Anonymous"
        response.append(rating_dict)
    
    return response

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.routes import stories, users
from app.database import engine, Base
from app.config import get_settings

settings = get_settings()

# Create database tables
Base.metadata.create_all(bind=engine)

# Create storage directories (for local development)
if settings.environment == "development":
    os.makedirs("storage/pdfs", exist_ok=True)
    os.makedirs("storage/covers", exist_ok=True)

app = FastAPI(
    title="Kids Story Library API",
    description="A magical library of AI-generated stories for children",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - allow frontend URLs
allowed_origins = [
    settings.frontend_url,
    "http://localhost:3000",
]

# In production, also allow Vercel preview URLs
if settings.environment == "production":
    allowed_origins.extend([
        "https://*.vercel.app",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
)

# Mount static files for PDF storage (local development only)
if settings.environment == "development" and os.path.exists("storage"):
    app.mount("/storage", StaticFiles(directory="storage"), name="storage")

# Include routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(stories.router, prefix="/stories", tags=["Stories"])


@app.get("/")
def root():
    return {
        "message": "Welcome to Kids Story Library API! 📚✨",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running smoothly!"}


@app.get("/seed")
def seed_database():
    """Seed the database with initial stories (call once)"""
    from app.database import SessionLocal
    from app.models import Story
    
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(Story).count() > 0:
        db.close()
        return {"message": "Database already seeded", "count": db.query(Story).count()}
    
    # Stories with Cloudinary cover URLs
    stories_data = [
        {
            "title": "Leo's Brave Little Roar",
            "author": "StoryLand",
            "description": "A wonderful adventure story about a brave little lion cub who finds his courage.",
            "cover_image_url": "https://res.cloudinary.com/dnb0vlwww/image/upload/v1771263669/kids-library/covers/1_leo_cover.png",
            "pdf_url": None,
            "page_count": 10,
            "age_group": "3-5",
            "theme": "adventure",
            "is_premium": False,
            "is_featured": True,
        },
        {
            "title": "The Magic Pencil",
            "author": "StoryLand", 
            "description": "A magical tale about a pencil that brings drawings to life.",
            "cover_image_url": "https://res.cloudinary.com/dnb0vlwww/image/upload/v1771263726/kids-library/covers/2_magic_pencil_cover.png",
            "pdf_url": None,
            "page_count": 10,
            "age_group": "6-8",
            "theme": "fantasy",
            "is_premium": False,
            "is_featured": True,
        },
        {
            "title": "Oliver the Owl Learns to Listen",
            "author": "StoryLand",
            "description": "Oliver the owl discovers the importance of listening to others.",
            "cover_image_url": "https://res.cloudinary.com/dnb0vlwww/image/upload/v1771263744/kids-library/covers/3_oliver_owl_cover.png",
            "pdf_url": None,
            "page_count": 10,
            "age_group": "6-8",
            "theme": "animals",
            "is_premium": False,
            "is_featured": True,
        },
        {
            "title": "Shelly the Sea Turtle",
            "author": "StoryLand",
            "description": "Follow Shelly on her ocean adventure to find her way home.",
            "cover_image_url": "https://res.cloudinary.com/dnb0vlwww/image/upload/v1771263766/kids-library/covers/4_shelly_turtle_cover.png",
            "pdf_url": None,
            "page_count": 10,
            "age_group": "6-8",
            "theme": "adventure",
            "is_premium": False,
            "is_featured": True,
        },
        {
            "title": "The Boy Who Flew Too High",
            "author": "StoryLand",
            "description": "An exciting adventure about dreams, courage, and knowing your limits.",
            "cover_image_url": "https://res.cloudinary.com/dnb0vlwww/image/upload/v1771263797/kids-library/covers/5_boy_flew_cover.png",
            "pdf_url": None,
            "page_count": 10,
            "age_group": "6-8",
            "theme": "adventure",
            "is_premium": False,
            "is_featured": True,
        },
        {
            "title": "The Gentle Giant and the Little Star",
            "author": "StoryLand",
            "description": "A heartwarming space story about friendship between a giant and a tiny star.",
            "cover_image_url": "https://res.cloudinary.com/dnb0vlwww/image/upload/v1771263824/kids-library/covers/6_gentle_giant_cover.png",
            "pdf_url": None,
            "page_count": 10,
            "age_group": "3-5",
            "theme": "space",
            "is_premium": False,
            "is_featured": True,
        },
    ]
    
    for data in stories_data:
        story = Story(**data)
        db.add(story)
    
    db.commit()
    db.close()
    
    return {"message": "Database seeded successfully!", "count": len(stories_data)}

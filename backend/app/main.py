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

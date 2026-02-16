from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database (supports SQLite locally, PostgreSQL in production)
    database_url: str = "sqlite:///./kids_library.db"
    
    # JWT
    secret_key: str = "your-super-secret-key-change-this"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Gemini AI
    gemini_api_key: str = ""
    
    # OpenAI (for DALL-E image generation)
    openai_api_key: str = ""
    
    # Cloudinary (for file storage in production)
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    
    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_id: str = ""
    
    # Frontend
    frontend_url: str = "http://localhost:3000"
    
    # Environment
    environment: str = "development"  # development or production
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

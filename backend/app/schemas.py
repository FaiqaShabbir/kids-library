from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


# ==================== User Schemas ====================
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_subscribed: bool
    subscription_tier: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# ==================== Story Schemas ====================
class StoryBase(BaseModel):
    title: str
    description: Optional[str] = None
    age_group: Optional[str] = None
    theme: Optional[str] = None


class StoryCreate(StoryBase):
    pass


class StoryGenerateRequest(BaseModel):
    title: str
    age_group: str  # 3-5, 6-8, 9-12
    theme: str  # adventure, fantasy, animals, friendship, etc.
    page_count: int = 10


class StoryResponse(StoryBase):
    id: int
    author: str
    cover_image_url: Optional[str]
    pdf_url: Optional[str]
    page_count: int
    is_premium: bool
    is_featured: bool
    read_count: int
    average_rating: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class StoryListResponse(BaseModel):
    stories: List[StoryResponse]
    total: int
    page: int
    page_size: int


# ==================== Rating Schemas ====================
class RatingCreate(BaseModel):
    story_id: int
    rating: float
    comment: Optional[str] = None


class RatingResponse(BaseModel):
    id: int
    story_id: int
    rating: float
    comment: Optional[str]
    created_at: datetime
    user_name: Optional[str] = None
    
    class Config:
        from_attributes = True


# ==================== Subscription Schemas ====================
class SubscriptionCreate(BaseModel):
    tier: str  # basic, premium


class CheckoutSessionResponse(BaseModel):
    checkout_url: str
    session_id: str

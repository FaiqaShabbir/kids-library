from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_subscribed = Column(Boolean, default=False)
    subscription_tier = Column(String(50), default="free")  # free, basic, premium
    stripe_customer_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    favorites = relationship("Favorite", back_populates="user")
    ratings = relationship("Rating", back_populates="user")


class Story(Base):
    __tablename__ = "stories"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    author = Column(String(100), default="StoryLand AI")
    description = Column(Text)
    cover_image_url = Column(String(500))
    pdf_url = Column(String(500))
    page_count = Column(Integer, default=10)
    age_group = Column(String(50))  # 3-5, 6-8, 9-12
    theme = Column(String(100))  # adventure, fantasy, animals, etc.
    is_premium = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    read_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    favorites = relationship("Favorite", back_populates="story")
    ratings = relationship("Rating", back_populates="story")


class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="favorites")
    story = relationship("Story", back_populates="favorites")


class Rating(Base):
    __tablename__ = "ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False)
    rating = Column(Float, nullable=False)  # 1-5 stars
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="ratings")
    story = relationship("Story", back_populates="ratings")

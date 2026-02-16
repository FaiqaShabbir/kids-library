"""
Seed the production database with initial data.
Run this after deploying to add your stories.

Usage:
    python seed_production.py
"""

import json
import os
from app.database import SessionLocal, engine, Base
from app.models import User, Story
from app.auth import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)


def seed_database():
    db = SessionLocal()
    
    try:
        # Check if already seeded
        existing_stories = db.query(Story).count()
        if existing_stories > 0:
            print(f"Database already has {existing_stories} stories. Skipping seed.")
            return
        
        print("Seeding production database...")
        
        # Create demo user
        demo_user = User(
            email="demo@storyland.com",
            hashed_password=get_password_hash("demo123"),
            full_name="Demo User",
            is_active=True,
            is_subscribed=False,
            subscription_tier="free"
        )
        db.add(demo_user)
        print("  Created demo user")
        
        # Load stories from JSON
        json_path = os.path.join(os.path.dirname(__file__), "seed_data.json")
        if os.path.exists(json_path):
            with open(json_path, "r") as f:
                data = json.load(f)
            
            for story_data in data.get("stories", []):
                # Remove id to let database assign new ones
                story_data.pop("id", None)
                story = Story(**story_data)
                db.add(story)
                print(f"  Added: {story_data['title']}")
        else:
            print("  No seed_data.json found - add stories manually")
        
        db.commit()
        print("\nDatabase seeded successfully!")
        
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

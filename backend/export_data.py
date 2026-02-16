"""
Export database data to JSON for production deployment.
"""

import json
from app.database import SessionLocal
from app.models import Story, User
from app.auth import get_password_hash

db = SessionLocal()

# Export stories
stories = []
for s in db.query(Story).all():
    stories.append({
        "id": s.id,
        "title": s.title,
        "author": s.author,
        "description": s.description,
        "cover_image_url": s.cover_image_url,
        "pdf_url": s.pdf_url,
        "page_count": s.page_count,
        "age_group": s.age_group,
        "theme": s.theme,
        "is_premium": s.is_premium,
        "is_featured": s.is_featured,
        "read_count": s.read_count,
    })

data = {
    "stories": stories,
    "demo_user": {
        "email": "demo@storyland.com",
        "password_hash": get_password_hash("demo123"),
        "full_name": "Demo User",
    }
}

with open("seed_data.json", "w") as f:
    json.dump(data, f, indent=2)

print(f"Exported {len(stories)} stories to seed_data.json")
db.close()

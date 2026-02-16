"""
Seed the database with sample stories for demonstration.
Run: python seed_data.py
"""
from app.database import SessionLocal, engine, Base
from app.models import Story, User
from app.auth import get_password_hash
from app.services.pdf_generator import create_story_pdf

# Create tables
Base.metadata.create_all(bind=engine)


def seed_stories():
    """Create sample stories"""
    db = SessionLocal()
    
    # Check if stories already exist
    if db.query(Story).count() > 0:
        print("Stories already seeded!")
        return
    
    sample_stories = [
        {
            "title": "The Brave Little Star",
            "description": "A small star learns that even the tiniest light can make a big difference in someone's life.",
            "age_group": "3-5",
            "theme": "friendship",
            "is_featured": True,
            "is_premium": False,
            "content": """--- Page 1 ---
High up in the night sky, there lived a little star named Twinkle.

[Illustration: A cute, small star with big sparkly eyes in a dark blue sky]

Twinkle was the smallest star in the whole galaxy, but she had the biggest dreams.

--- Page 2 ---
"I wish I could shine as bright as the big stars," Twinkle sighed one night.

The Moon, who was very wise, heard her wish.

[Illustration: A kind, smiling Moon talking to the little star]

"Little one," said the Moon, "brightness comes from within."

--- Page 3 ---
One evening, a little girl on Earth couldn't sleep. She was scared of the dark.

She looked up at the sky, searching for comfort.

[Illustration: A sad little girl looking out her window at the sky]

--- Page 4 ---
Twinkle saw the little girl and wanted to help.

She focused all her energy and began to twinkle with all her might!

[Illustration: Twinkle glowing extra bright with determination]

--- Page 5 ---
The little girl saw Twinkle's light and smiled.

"Look, Mommy! A star is winking at me!"

[Illustration: The girl pointing happily at the sky, no longer scared]

From that night on, Twinkle knew that even the smallest light can make a big difference.

--- The End ---
"""
        },
        {
            "title": "Luna's Magical Garden",
            "description": "Luna discovers a secret garden where flowers can talk and teaches about caring for nature.",
            "age_group": "6-8",
            "theme": "nature",
            "is_featured": True,
            "is_premium": False,
            "content": """--- Page 1 ---
Luna loved exploring the forest behind her grandmother's house.

[Illustration: A curious girl with wild curly hair walking through a sunny forest]

One day, she found a hidden path she had never seen before.

--- Page 2 ---
The path led to the most beautiful garden she had ever seen!

Flowers of every color swayed in the breeze, and butterflies danced in the air.

[Illustration: A magical garden with oversized colorful flowers and sparkles]

--- Page 3 ---
"Welcome, Luna!" said a cheerful voice.

Luna looked around. A sunflower was smiling at her!

[Illustration: A friendly sunflower with a smiling face talking to Luna]

"Did you just... talk?" Luna gasped.

--- Page 4 ---
"Of course! In this garden, all flowers can speak," giggled a rose nearby.

The flowers told Luna their secret: the garden needed someone to care for it.

[Illustration: Luna surrounded by various talking flowers]

--- Page 5 ---
Luna promised to visit every day. She watered the flowers, pulled weeds, and sang to them.

[Illustration: Luna happily gardening while flowers smile]

The garden grew more beautiful, and Luna learned that caring for nature brings magic to life.

--- The End ---
"""
        },
        {
            "title": "Captain Whiskers' Ocean Adventure",
            "description": "A house cat dreams of being a sea captain and goes on an unexpected adventure.",
            "age_group": "6-8",
            "theme": "adventure",
            "is_featured": True,
            "is_premium": False,
            "content": """--- Page 1 ---
Captain Whiskers was no ordinary cat. Every night, he dreamed of sailing the seven seas.

[Illustration: An orange tabby cat wearing a captain's hat, looking at a fishbowl]

His fishbowl was his ocean, and his toy boat was his ship.

--- Page 2 ---
One stormy night, something magical happened.

Lightning flashed, and suddenly, Captain Whiskers found himself on a REAL ship!

[Illustration: A surprised cat on a wooden pirate ship during a storm]

--- Page 3 ---
"All paws on deck!" he shouted, and a crew of mice appeared!

"Aye aye, Captain!" they squeaked.

[Illustration: Sailor mice saluting Captain Whiskers]

--- Page 4 ---
They sailed through waves as tall as mountains and discovered a treasure island!

But the treasure was not gold -- it was the biggest ball of yarn Captain Whiskers had ever seen!

[Illustration: The cat and mice discovering a giant ball of colorful yarn]

--- Page 5 ---
When morning came, Captain Whiskers woke up in his cozy bed.

Was it a dream? Maybe... but there was sea salt in his whiskers and a tiny sailor hat beside him.

[Illustration: The cat waking up with a mysterious smile]

--- The End ---
"""
        },
        {
            "title": "The Dragon Who Couldn't Breathe Fire",
            "description": "A young dragon named Ember learns that being different can be a superpower.",
            "age_group": "6-8",
            "theme": "fantasy",
            "is_featured": False,
            "is_premium": True,
            "content": """--- Page 1 ---
In Dragon Valley, every young dragon learned to breathe fire on their fifth birthday.

[Illustration: Baby dragons practicing breathing fire in a rocky valley]

But when Ember tried, only sparkly bubbles came out!

--- Page 2 ---
The other dragons laughed. "Bubble-brain!" they teased.

Ember felt so embarrassed. She flew away to hide in a cave.

[Illustration: A sad little dragon blowing bubbles while others laugh]

--- Page 3 ---
One day, the village was in trouble! A magic curse made everyone forget how to be happy.

No amount of fire could break the spell.

[Illustration: Sad dragons in a gloomy village]

--- Page 4 ---
Ember had an idea. She flew to the center of the village and took a deep breath.

She blew the most beautiful, rainbow-colored bubbles anyone had ever seen!

[Illustration: Ember creating magnificent rainbow bubbles]

--- Page 5 ---
The bubbles popped on the dragons' noses, and suddenly, everyone started laughing!

The spell was broken by JOY, not fire.

[Illustration: Happy dragons playing with bubbles, Ember celebrated as a hero]

From that day on, Ember was the most beloved dragon in all the land.

--- The End ---
"""
        },
        {
            "title": "The Friendship Rocket",
            "description": "Two best friends build a rocket and learn about teamwork and space.",
            "age_group": "9-12",
            "theme": "space",
            "is_featured": True,
            "is_premium": False,
            "content": """--- Page 1 ---
Maya loved science, and her best friend Leo loved art.

Together, they had a wild dream: to build a rocket and visit the stars!

[Illustration: Two kids looking at the night sky with notebooks and pencils]

--- Page 2 ---
"I'll handle the engineering," said Maya, drawing blueprints.

"And I'll make it look amazing," added Leo, sketching colorful designs.

[Illustration: Maya with equations and Leo with paint, working together]

--- Page 3 ---
They worked for months in Maya's backyard.

There were arguments and mistakes, but they never gave up on each other.

[Illustration: The two friends building a colorful rocket ship]

--- Page 4 ---
Finally, launch day arrived! The whole neighborhood came to watch.

"3... 2... 1... BLAST OFF!"

[Illustration: A colorful rocket launching with cheering crowd below]

--- Page 5 ---
The rocket soared higher than anyone expected!

Through the window, Maya and Leo saw Earth—a beautiful blue marble floating in space.

[Illustration: Two friends looking at Earth through a spaceship window]

--- Page 6 ---
"We did it," Maya whispered.

"Together," Leo smiled.

They realized that the best adventures are the ones you share with friends.

[Illustration: The two friends floating in zero gravity, high-fiving]

--- The End ---
"""
        },
        {
            "title": "The Sleepy Cloud",
            "description": "A tired little cloud learns the importance of rest and sweet dreams.",
            "age_group": "3-5",
            "theme": "bedtime",
            "is_featured": True,
            "is_premium": False,
            "content": """--- Page 1 ---
High in the sky lived a fluffy little cloud named Cumulus.

[Illustration: A cute, puffy white cloud with sleepy eyes]

Cumulus loved floating around all day, but he never wanted to rest.

--- Page 2 ---
"Sleep is boring!" Cumulus said, yawning.

But without rest, his fluff started drooping, and he couldn't make rain anymore.

[Illustration: A tired, saggy cloud looking exhausted]

--- Page 3 ---
The flowers below were so thirsty! They looked up with sad faces.

"Please, little cloud, we need water," they called.

[Illustration: Wilting flowers looking up at the tired cloud]

--- Page 4 ---
The Moon came out and wrapped Cumulus in a blanket of stars.

"Rest now, little one. You'll feel better in the morning."

[Illustration: The Moon tucking the cloud in with twinkling stars]

--- Page 5 ---
Cumulus had the sweetest dreams of rainbow rivers and singing birds.

When he woke up, he was fluffy and full of rain!

[Illustration: A refreshed, happy cloud raining on grateful flowers]

The flowers danced in the rain, and Cumulus learned that rest makes us strong.

--- The End ---

Sweet dreams, little one!
"""
        }
    ]
    
    for story_data in sample_stories:
        content = story_data.pop("content")
        
        # Create PDF
        pdf_path = create_story_pdf(story_data["title"], content)
        
        # Create story record
        story = Story(
            **story_data,
            pdf_url=pdf_path,
            page_count=content.count("--- Page"),
            cover_image_url=f"/storage/covers/{story_data['theme']}.jpg"
        )
        db.add(story)
    
    db.commit()
    print(f"Created {len(sample_stories)} sample stories!")
    db.close()


def seed_demo_user():
    """Create a demo user"""
    db = SessionLocal()
    
    # Check if demo user exists
    if db.query(User).filter(User.email == "demo@storyland.com").first():
        print("Demo user already exists!")
        return
    
    demo_user = User(
        email="demo@storyland.com",
        hashed_password=get_password_hash("demo123"),
        full_name="Demo User",
        is_subscribed=True,
        subscription_tier="premium"
    )
    db.add(demo_user)
    db.commit()
    print("Created demo user: demo@storyland.com / demo123")
    db.close()


if __name__ == "__main__":
    print("Seeding Kids Story Library database...")
    seed_stories()
    seed_demo_user()
    print("Done!")

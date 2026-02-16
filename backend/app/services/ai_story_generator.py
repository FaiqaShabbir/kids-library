import google.generativeai as genai
from app.config import get_settings

settings = get_settings()


async def generate_story_with_gemini(
    title: str,
    age_group: str,
    theme: str,
    page_count: int = 10
) -> str:
    """
    Generate a children's story using Google Gemini AI.
    
    Args:
        title: The story title
        age_group: Target age group (3-5, 6-8, 9-12)
        theme: Story theme (adventure, fantasy, animals, etc.)
        page_count: Number of pages for the story
    
    Returns:
        Generated story text
    """
    # Configure Gemini
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel('gemini-pro')
    
    # Build the prompt
    age_descriptions = {
        "3-5": "very young children (ages 3-5). Use simple words, short sentences, and lots of repetition. Focus on basic emotions and simple concepts.",
        "6-8": "early readers (ages 6-8). Use engaging vocabulary, simple plot structures, and relatable characters. Include some dialogue.",
        "9-12": "middle-grade readers (ages 9-12). Use richer vocabulary, more complex plots, and character development. Include meaningful themes."
    }
    
    age_desc = age_descriptions.get(age_group, age_descriptions["6-8"])
    
    prompt = f"""Write a captivating children's story with the following specifications:

TITLE: "{title}"
TARGET AUDIENCE: {age_desc}
THEME: {theme}
LENGTH: Approximately {page_count} pages (about {page_count * 200} words total)

REQUIREMENTS:
1. Create an engaging opening that hooks young readers
2. Develop relatable characters with clear personalities
3. Include a clear beginning, middle, and end
4. Incorporate the {theme} theme naturally throughout
5. Add dialogue to make characters come alive
6. Include sensory details (sights, sounds, feelings)
7. End with a satisfying conclusion and a gentle moral lesson
8. Make it fun and entertaining!

FORMAT:
- Divide the story into {page_count} sections (one per page)
- Mark each section with "--- Page X ---"
- Each page should have approximately 150-250 words
- Include suggestions for illustrations in [brackets] at key moments

Please write the complete story now:"""

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        # Fallback story for demo/testing
        return generate_fallback_story(title, theme, page_count)


def generate_fallback_story(title: str, theme: str, page_count: int) -> str:
    """Generate a simple fallback story if AI is unavailable"""
    fallback = f"""--- Page 1 ---
{title}

Once upon a time, in a magical land far away, there lived a curious little creature who loved {theme}.

[Illustration: A whimsical landscape with colorful hills and a friendly creature]

Every day, they would wake up with excitement, ready for new adventures.

--- Page 2 ---
One morning, something special happened...

The little creature discovered a hidden path that led to an extraordinary place.

[Illustration: A mysterious, sparkling path through an enchanted forest]

"What could be at the end of this path?" they wondered with wide, curious eyes.

--- Page 3 ---
With courage in their heart, our hero set off on the adventure.

Along the way, they met friendly companions who joined the journey.

[Illustration: The creature making new friends]

Together, they were ready to face any challenge!

"""
    
    # Add more pages
    for i in range(4, page_count + 1):
        fallback += f"""--- Page {i} ---
The adventure continued with more excitement and wonder.

Our friends learned valuable lessons about {theme} and friendship.

[Illustration: Exciting scene from the adventure]

"""
    
    fallback += """
--- The End ---

And so, our hero returned home, forever changed by the amazing adventure.

[Illustration: Happy ending scene with all characters together]

The moral of the story: Every day holds the possibility for magic and wonder, if only we're brave enough to seek it.
"""
    
    return fallback

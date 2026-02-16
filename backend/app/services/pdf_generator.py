from fpdf import FPDF
import os
import re
from datetime import datetime


def sanitize_text(text: str) -> str:
    """
    Replace Unicode characters with ASCII equivalents for PDF compatibility.
    """
    replacements = {
        '\u2014': '--',    # em-dash
        '\u2013': '-',     # en-dash
        '\u2018': "'",     # left single quote
        '\u2019': "'",     # right single quote
        '\u201c': '"',     # left double quote
        '\u201d': '"',     # right double quote
        '\u2026': '...',   # ellipsis
        '\u2022': '*',     # bullet
        '\u00a0': ' ',     # non-breaking space
        '\u2003': ' ',     # em space
        '\u2002': ' ',     # en space
        '\u00b7': '*',     # middle dot
        '\u2212': '-',     # minus sign
        '\u00d7': 'x',     # multiplication sign
        '\u00f7': '/',     # division sign
        '\u2032': "'",     # prime
        '\u2033': '"',     # double prime
        '\u00ae': '(R)',   # registered trademark
        '\u00a9': '(C)',   # copyright
        '\u2122': '(TM)',  # trademark
    }
    
    for unicode_char, ascii_char in replacements.items():
        text = text.replace(unicode_char, ascii_char)
    
    # Remove emojis and other non-BMP characters
    text = ''.join(char for char in text if ord(char) < 0x10000)
    
    # Remove any remaining non-latin1 characters (replace with ?)
    text = text.encode('latin-1', errors='ignore').decode('latin-1')
    
    return text


class StoryPDF(FPDF):
    """Custom PDF class for children's stories"""
    
    def __init__(self, title: str):
        super().__init__()
        self.story_title = title
        self.set_auto_page_break(auto=True, margin=20)
    
    def header(self):
        """Add header to each page"""
        self.set_font("Helvetica", "I", 10)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, sanitize_text(self.story_title), align="C")
        self.ln(15)
    
    def footer(self):
        """Add footer with page number"""
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")
    
    def add_title_page(self, title: str, author: str = "StoryLand AI"):
        """Add a beautiful title page"""
        self.add_page()
        
        # Background color effect (light gradient simulation)
        self.set_fill_color(255, 250, 240)  # Warm cream color
        self.rect(0, 0, 210, 297, "F")
        
        # Title
        self.set_y(80)
        self.set_font("Helvetica", "B", 32)
        self.set_text_color(70, 130, 180)  # Steel blue
        self.multi_cell(0, 15, sanitize_text(title), align="C")
        
        # Decorative line
        self.ln(10)
        self.set_draw_color(255, 182, 193)  # Light pink
        self.set_line_width(2)
        self.line(60, self.get_y(), 150, self.get_y())
        
        # Author
        self.ln(20)
        self.set_font("Helvetica", "I", 16)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, sanitize_text(f"Written by {author}"), align="C")
        
        # Date
        self.ln(30)
        self.set_font("Helvetica", "", 12)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, datetime.now().strftime("%B %Y"), align="C")
    
    def add_story_page(self, content: str, page_num: int = None):
        """Add a story content page"""
        self.add_page()
        
        # Page number indicator at top
        if page_num:
            self.set_font("Helvetica", "B", 14)
            self.set_text_color(255, 182, 193)
            self.cell(0, 10, f"~ {page_num} ~", align="C")
            self.ln(10)
        
        # Story content
        self.set_font("Helvetica", "", 14)
        self.set_text_color(50, 50, 50)
        
        # Process content - handle illustration notes
        lines = content.split("\n")
        for line in lines:
            line = line.strip()
            if not line:
                self.ln(5)
                continue
            
            # Check for illustration notes
            if line.startswith("[") and line.endswith("]"):
                self.set_font("Helvetica", "I", 11)
                self.set_text_color(100, 150, 100)
                self.multi_cell(0, 8, sanitize_text(line))
                self.set_font("Helvetica", "", 14)
                self.set_text_color(50, 50, 50)
                self.ln(5)
            else:
                self.multi_cell(0, 8, sanitize_text(line))
                self.ln(3)


def create_story_pdf(title: str, content: str, page_count: int = 10) -> str:
    """
    Create a PDF from story content.
    
    Args:
        title: Story title
        content: Full story content with page markers
        page_count: Expected number of pages
    
    Returns:
        Path to the generated PDF file
    """
    # Create output directory if it doesn't exist
    output_dir = "storage/pdfs"
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate filename
    safe_title = re.sub(r'[^\w\s-]', '', title).strip().replace(' ', '_')
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{safe_title}_{timestamp}.pdf"
    output_path = os.path.join(output_dir, filename)
    
    # Create PDF
    pdf = StoryPDF(title)
    
    # Add title page
    pdf.add_title_page(title)
    
    # Parse and add story pages
    pages = parse_story_pages(content)
    
    for i, page_content in enumerate(pages, 1):
        if page_content.strip():
            pdf.add_story_page(page_content, page_num=i)
    
    # Save PDF
    pdf.output(output_path)
    
    return output_path


def parse_story_pages(content: str) -> list:
    """
    Parse story content into individual pages.
    
    Looks for markers like "--- Page X ---" or similar patterns.
    """
    # Try to split by page markers
    page_pattern = r'---\s*Page\s*\d+\s*---'
    pages = re.split(page_pattern, content, flags=re.IGNORECASE)
    
    # Filter out empty pages
    pages = [p.strip() for p in pages if p.strip()]
    
    # If no page markers found, split by paragraph count
    if len(pages) <= 1:
        paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
        
        # Group paragraphs into pages (roughly 3-4 paragraphs per page)
        pages = []
        current_page = []
        for para in paragraphs:
            current_page.append(para)
            if len(current_page) >= 3:
                pages.append("\n\n".join(current_page))
                current_page = []
        
        if current_page:
            pages.append("\n\n".join(current_page))
    
    return pages


def create_sample_stories():
    """Create sample story PDFs for the library"""
    sample_stories = [
        {
            "title": "The Brave Little Star",
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

[Illustration: A sad little girl looking out her window at the sky]

She looked up at the sky, searching for comfort.

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
        }
    ]
    
    created_files = []
    for story in sample_stories:
        path = create_story_pdf(story["title"], story["content"])
        created_files.append(path)
    
    return created_files

# 📚 StoryLand - Kids Story Library

A magical platform for AI-generated children's stories with a beautiful, kid-friendly interface.

![StoryLand](https://via.placeholder.com/800x400/ff6b8a/ffffff?text=StoryLand+-+Magical+Stories+for+Kids)

## ✨ Features

- 🎨 **Beautiful UI** - Whimsical, kid-friendly design with animations
- 📖 **Story Library** - Browse stories by theme and age group
- 🤖 **AI Cover Generation** - Beautiful DALL-E generated cover images
- 📥 **PDF Downloads** - Download stories for offline reading
- 📱 **In-Browser Reading** - Read stories directly on the website
- ⭐ **Ratings & Reviews** - Community feedback on stories
- ❤️ **Favorites** - Save favorite stories for easy access

## 🛠️ Tech Stack

### Backend
- **Python 3.11+** with FastAPI
- **SQLAlchemy** for ORM
- **SQLite** (development) / PostgreSQL (production)
- **OpenAI DALL-E** for cover image generation
- **Cloudinary** for image/PDF storage
- **FPDF2** for PDF creation

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **Axios** for API calls

## 🚀 Quick Start

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
copy .env.example .env  # Windows
# cp .env.example .env  # Mac/Linux

# Edit .env and add your API keys:
# - OPENAI_API_KEY (for DALL-E cover generation)
# - CLOUDINARY credentials (for cloud storage)

# Seed the database with sample stories
python seed_data.py

# Run the server
python run.py
```

The API will be available at `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
kids-library/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── auth.py           # Authentication
│   │   ├── config.py         # Configuration
│   │   ├── database.py       # Database setup
│   │   ├── routes/
│   │   │   ├── users.py      # User endpoints
│   │   │   ├── stories.py    # Story endpoints
│   │   │   └── subscriptions.py
│   │   └── services/
│   │       ├── ai_story_generator.py
│   │       └── pdf_generator.py
│   ├── storage/              # PDF storage
│   ├── requirements.txt
│   ├── run.py
│   └── seed_data.py
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # Home page
│   │   │   ├── layout.tsx    # Root layout
│   │   │   ├── globals.css   # Global styles
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── pricing/
│   │   │   └── stories/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── StoryCard.tsx
│   │   │   └── HeroSection.tsx
│   │   └── lib/
│   │       ├── api.ts        # API client
│   │       └── store.ts      # Zustand store
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
└── README.md
```

## 🔑 Demo Account

```
Email: demo@storyland.com
Password: demo123
```

## 🎨 Customization

### Adding New Themes
Edit `backend/app/routes/stories.py` to add new themes in the `get_available_themes()` function.

### Modifying Colors
Edit `frontend/tailwind.config.ts` to customize the color palette.

### AI Story Prompts
Edit `backend/app/services/ai_story_generator.py` to customize story generation prompts.

## 🚢 Deployment

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy!

### Frontend (Vercel)
1. Import project from GitHub
2. Add `NEXT_PUBLIC_API_URL` environment variable
3. Deploy!

## 📝 API Endpoints

### Authentication
- `POST /users/register` - Register new user
- `POST /users/login` - Login and get token
- `GET /users/me` - Get current user

### Stories
- `GET /stories/` - List stories (paginated)
- `GET /stories/featured` - Get featured stories
- `GET /stories/{id}` - Get story details
- `GET /stories/{id}/view` - View PDF in browser
- `GET /stories/{id}/download` - Download PDF
- `GET /stories/{id}/cover` - Get cover image
- `POST /stories/{id}/favorite` - Toggle favorite
- `POST /stories/{id}/rate` - Rate story

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own purposes!

---

Made with ❤️ for little readers everywhere 📚✨

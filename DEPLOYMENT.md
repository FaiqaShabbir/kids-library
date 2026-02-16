# Free Deployment Guide 🚀

Deploy your Kids Story Library completely FREE using:
- **Vercel** - Frontend hosting (Next.js)
- **Render** - Backend hosting (FastAPI)
- **Supabase** - PostgreSQL database
- **Cloudinary** - PDF & Image storage

---

## Step 1: Create Free Accounts

Create accounts at these services (all have generous free tiers):

1. **GitHub**: https://github.com (to host your code)
2. **Vercel**: https://vercel.com (frontend)
3. **Render**: https://render.com (backend)
4. **Supabase**: https://supabase.com (database)
5. **Cloudinary**: https://cloudinary.com (file storage)

---

## Step 2: Setup Cloudinary (File Storage)

1. Go to https://cloudinary.com and sign up
2. Go to Dashboard → Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret
3. Add to your local `.env` file:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Upload your local files to Cloudinary:
   ```powershell
   cd "D:\kids library\backend"
   python upload_to_cloud.py
   ```

---

## Step 3: Push Code to GitHub

1. Create a new repository on GitHub
2. Push your code:
   ```powershell
   cd "D:\kids library"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/kids-library.git
   git push -u origin main
   ```

---

## Step 4: Setup Supabase Database

1. Go to https://supabase.com → New Project
2. Create a new project (free tier)
3. Go to Settings → Database → Connection String
4. Copy the **URI** connection string (starts with `postgresql://`)
5. Save this for Step 5

---

## Step 5: Deploy Backend on Render

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: kids-library-api
   - **Root Directory**: backend
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

4. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://... (from Supabase)
   SECRET_KEY=generate-a-random-string-here
   ENVIRONMENT=production
   FRONTEND_URL=https://your-app.vercel.app
   OPENAI_API_KEY=sk-... (your key)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. Click **Create Web Service**
6. Wait for deployment (takes 5-10 minutes)
7. Copy your Render URL: `https://kids-library-api.onrender.com`

---

## Step 6: Deploy Frontend on Vercel

1. Go to https://vercel.com → New Project
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: frontend
   - **Framework Preset**: Next.js

4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://kids-library-api.onrender.com
   ```

5. Click **Deploy**
6. Your site is live! 🎉

---

## Step 7: Seed Your Database

After deployment, you need to add your stories to the production database:

1. On Render, go to your web service → Shell
2. Run:
   ```bash
   python seed_production.py
   ```

Or connect to Supabase directly and run the SQL to insert your stories.

---

## Alternative: One-Click Render Deploy

You can also use the Render Blueprint for automatic setup:

1. Go to https://render.com/deploy
2. Connect GitHub
3. Select your repository
4. Render will read `render.yaml` and set up everything automatically

---

## Free Tier Limits

| Service | Free Limit |
|---------|------------|
| **Vercel** | 100GB bandwidth, unlimited deploys |
| **Render** | 750 hours/month (sleeps after 15min inactivity) |
| **Supabase** | 500MB database, 1GB storage |
| **Cloudinary** | 25GB storage, 25GB bandwidth |

### Tips to Stay Free:
- Render free tier sleeps after 15 min - first request takes ~30s to wake up
- Keep database small - Supabase gives 500MB free
- Cloudinary is generous - 25GB should be plenty for PDFs

---

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify DATABASE_URL is correct
- Make sure all env vars are set

### Frontend can't reach backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS settings in backend
- Make sure FRONTEND_URL env var on Render matches your Vercel URL

### PDFs not loading
- Run `python upload_to_cloud.py` to upload files to Cloudinary
- Verify Cloudinary credentials are set on Render

---

## Custom Domain (Optional)

Both Vercel and Render support custom domains on free tier:

1. Buy a domain (Namecheap, Cloudflare, etc.)
2. On Vercel: Settings → Domains → Add
3. On Render: Settings → Custom Domains → Add
4. Update DNS records as instructed

---

## Need Help?

- Vercel docs: https://vercel.com/docs
- Render docs: https://render.com/docs
- Supabase docs: https://supabase.com/docs
- Cloudinary docs: https://cloudinary.com/documentation

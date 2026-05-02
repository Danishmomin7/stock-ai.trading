# Deployment Guide - Netlify & Render

## 📋 Prerequisites

- GitHub account (create at github.com)
- Netlify account (already have)
- Render account (free at render.com)

---

## 🚀 Step 1: Push to GitHub

### 1.1 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `stock-ai-trading-platform`
3. Description: `AI-powered stock analysis and paper trading platform`
4. Choose **Public** (for easy deployment)
5. Click **Create repository**

### 1.2 Initialize Git & Push Code

Run these commands in your project folder:

```bash
git init
git add .
git commit -m "Initial commit: Stock AI Trading Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stock-ai-trading-platform.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (easiest)

### 2.2 Create Web Service

1. Click **New** → **Web Service**
2. Select your GitHub repository
3. Fill in details:
   - **Name**: `stock-ai-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend5:app --host 0.0.0.0 --port $PORT`

### 2.3 Add Environment Variables

In Render dashboard:

1. Go to your service → **Environment**
2. Add these variables:
   - **DATABASE_URL**: `postgresql+psycopg2://user:password@your-db:5432/stock_ai`
     (Or use SQLite for now)
   - **PYTHONUNBUFFERED**: `true`

### 2.4 Deploy

Click **Deploy** - Render will automatically build and deploy when you push to GitHub.

**Copy the backend URL** (will look like `https://stock-ai-backend.onrender.com`)

---

## 🎨 Step 3: Deploy Frontend to Netlify

### 3.1 Build Production Version Locally

```bash
npm run build
```

This creates a `dist/` folder with optimized files.

### 3.2 Connect Netlify to GitHub

1. Go to https://app.netlify.com
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub**
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist`

### 3.3 Add Environment Variables

In Netlify:
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add variable:
   - **VITE_API_URL**: `https://stock-ai-backend.onrender.com` (your Render backend URL)

### 3.4 Deploy

Click **Deploy site** - Netlify will build and deploy automatically!

**Your site URL**: `https://your-site-name.netlify.app`

---

## ⚙️ Step 4: Configure Backend-Frontend Communication

### Update Production Backend URL

In your `src/api.js`, you can update to use environment variable:

```javascript
const API_BASE = import.meta.env.VITE_API_URL || '/api';
```

### Update CORS in backend

In `backend5.py`, update CORS origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Dev
        "https://your-site-name.netlify.app",  # Production
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🗄️ Step 5: Setup Database (Optional)

### For Production with PostgreSQL:

1. **Use Render PostgreSQL** (easiest):
   - In Render dashboard: **New** → **PostgreSQL**
   - Get the internal URL
   - Add to backend environment variables

2. **Or use Railway/Heroku PostgreSQL**

### Keep Environment Variables Secure

In `.env` (local only - never commit):
```
DATABASE_URL=postgresql+psycopq2://user:pass@host:5432/db
```

---

## 📱 Final URLs

After deployment, you'll have:

- **Frontend**: `https://your-site-name.netlify.app`
- **Backend API**: `https://stock-ai-backend.onrender.com`
- **Live Trades**: Data saved to PostgreSQL database

---

## ✅ Testing Deployment

1. Open your Netlify frontend URL
2. Search for a stock (AAPL, GOOGL, etc.)
3. Execute a paper trade
4. Refresh page - data should persist in database

---

## 🐛 Troubleshooting

### "CORS error" when trading
- Update `allow_origins` in `backend5.py`
- Redeploy backend

### "Cannot connect to API"
- Check `VITE_API_URL` environment variable on Netlify
- Verify Render backend is running

### "Database connection error"
- Ensure `DATABASE_URL` is correct
- Test locally first: `python init_db.py`

### Build fails on Netlify
- Run `npm run build` locally to see error
- Check `build/` output
- Verify all imports are correct

---

## 🔄 Continuous Deployment

Now whenever you push to GitHub:
1. Netlify automatically rebuilds frontend
2. Render automatically rebuilds backend
3. Live in minutes! ⚡

---

## 💡 Next Steps

1. ✅ Push to GitHub
2. ✅ Deploy backend to Render
3. ✅ Deploy frontend to Netlify
4. ✅ Set environment variables
5. 🎉 Go live!

Need help? Check logs on Netlify/Render dashboard for detailed errors.

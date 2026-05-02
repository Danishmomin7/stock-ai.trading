# 🚀 Quick Deployment Checklist

## ✅ What's Ready

- ✅ Frontend built (`dist/` folder created)
- ✅ Backend ready (FastAPI + SQLAlchemy)
- ✅ Database configured (SQLite by default)
- ✅ Environment files created
- ✅ All deployment configs ready

---

## 📋 Step-by-Step Deployment

### **Step 1: Create GitHub Repository (5 min)**

1. Go to https://github.com/new
2. Repository name: `stock-ai-trading`
3. Click **Create repository**

### **Step 2: Push Code to GitHub**

Run in your project folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stock-ai-trading.git
git push -u origin main
```

*(Replace `YOUR_USERNAME` with your GitHub username)*

---

### **Step 3: Deploy Backend to Render (10 min)**

1. Go to https://render.com (sign up with GitHub)
2. Click **New** → **Web Service**
3. Select your GitHub repo
4. Fill in:
   - Name: `stock-ai-backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn backend5:app --host 0.0.0.0 --port $PORT`
5. Click **Deploy**

**Copy your backend URL** (looks like `https://stock-ai-backend.onrender.com`)

---

### **Step 4: Deploy Frontend to Netlify (5 min)**

1. Go to https://app.netlify.com
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** and select your repo
4. Build settings should auto-fill:
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
5. Click **Deploy site**

---

### **Step 5: Add Environment Variables**

**In Netlify Dashboard:**

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add variable:
   ```
   VITE_API_URL = https://stock-ai-backend.onrender.com
   ```
   *(Use the Render URL from Step 3)*

3. Click **Redeploy** to rebuild with new URL

---

## 🎉 Your App is Live!

| Component | URL |
|-----------|-----|
| 🎨 Frontend | `https://your-site-name.netlify.app` |
| 🔧 Backend API | `https://stock-ai-backend.onrender.com` |
| 💾 Database | SQLite (local) or PostgreSQL (production) |

---

## ⚙️ Optional: Use PostgreSQL in Production

If you want persistent database in cloud:

1. Create PostgreSQL on Render:
   - Render dashboard → **New** → **PostgreSQL**
   - Get the internal URL

2. Add to Render backend environment variables:
   ```
   DATABASE_URL = postgresql+psycopg2://...
   ```

3. Redeploy backend

---

## 🔄 Future Updates

After initial setup, just push to GitHub:

```bash
git add .
git commit -m "Update message"
git push
```

Netlify and Render will **automatically redeploy** within minutes! ⚡

---

## 📞 Support

- Netlify docs: https://docs.netlify.com
- Render docs: https://render.com/docs
- FastAPI: https://fastapi.tiangolo.com

---

**Ready? Start with Step 1!** 🚀

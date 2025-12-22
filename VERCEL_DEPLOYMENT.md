# 🚀 Complete Vercel Deployment Guide

**Deploy NexusMind to Vercel (Frontend) + Railway (Backend) - FREE TIER**

---

## 📋 Prerequisites

- ✅ GitHub account ([Sign up](https://github.com/))
- ✅ Vercel account ([Sign up](https://vercel.com/))
- ✅ Railway account ([Sign up](https://railway.app/))
- ✅ Supabase account ([Sign up](https://supabase.com/))
- ✅ Your NexusMind code ready

---

## 🎯 Deployment Overview

We'll deploy in this order:
1. **Database** - Supabase (already set up)
2. **Backend** - Railway.app (FREE)
3. **Frontend** - Vercel (FREE)

**Total Cost:** $0/month on free tiers!

---

## PART 1: Setup GitHub Repository

### **Step 1: Initialize Git**

```bash
# Navigate to your project
cd D:\Project\NexusMind

# Initialize git (if not already done)
git init

# Create .gitignore
echo "# Environment
.env
.env.local
.env.production

# Python
__pycache__/
*.pyc
venv/
env/

# Node
node_modules/
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store" > .gitignore
```

### **Step 2: Create GitHub Repository**

1. Go to [GitHub](https://github.com/)
2. Click **"New repository"**
3. Name: `nexusmind`
4. Description: `AI-powered note-taking app with offline support`
5. **Public** or **Private** (your choice)
6. **Don't** initialize with README (we have one)
7. Click **"Create repository"**

### **Step 3: Push Code to GitHub**

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit - NexusMind v1.0"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/nexusmind.git

# Push to GitHub
git push -u origin main
```

**✅ Checkpoint:** Your code is now on GitHub!

---

## PART 2: Deploy Backend to Railway

### **Step 1: Create Railway Account**

1. Go to [Railway.app](https://railway.app/)
2. Click **"Start a New Project"**
3. Sign in with GitHub
4. Authorize Railway

### **Step 2: Create New Project**

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `nexusmind` repository
4. Railway will detect it's a Python project

### **Step 3: Configure Backend**

1. Click on your deployment
2. Go to **"Settings"**
3. **Root Directory:** Set to `backend`
4. **Build Command:** Leave empty (auto-detected)
5. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

### **Step 4: Add Environment Variables**

1. Go to **"Variables"** tab
2. Click **"+ New Variable"**
3. Add these variables:

```bash
# Supabase (get from your Supabase dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# JWT Secret (generate random string)
JWT_SECRET_KEY=your-random-secret-key-here

# Frontend URL (we'll update this after Vercel deployment)
FRONTEND_URL=http://localhost:5173

# AI (optional - can add later)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Email (optional - can add later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**How to get Supabase credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY`

**How to generate JWT_SECRET_KEY:**
```bash
# In PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### **Step 5: Deploy Backend**

1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. Once deployed, you'll see a URL like: `https://nexusmind-production.up.railway.app`
4. **Copy this URL** - you'll need it for frontend!

### **Step 6: Test Backend**

1. Open the Railway URL in browser
2. Add `/docs` to the end: `https://your-app.up.railway.app/docs`
3. You should see FastAPI documentation
4. ✅ Backend is live!

**✅ Checkpoint:** Backend deployed on Railway!

---

## PART 3: Deploy Frontend to Vercel

### **Step 1: Create Vercel Account**

1. Go to [Vercel.com](https://vercel.com/)
2. Click **"Sign Up"**
3. Sign in with GitHub
4. Authorize Vercel

### **Step 2: Import Project**

1. Click **"Add New..."** → **"Project"**
2. Import your `nexusmind` repository
3. Vercel will detect it's a Vite project

### **Step 3: Configure Frontend**

1. **Framework Preset:** Vite
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### **Step 4: Add Environment Variables**

1. Scroll to **"Environment Variables"**
2. Add this variable:

```bash
VITE_API_URL=https://your-railway-app.up.railway.app
```

**Replace** `your-railway-app.up.railway.app` with your actual Railway URL from Part 2!

### **Step 5: Deploy Frontend**

1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. You'll get a URL like: `https://nexusmind.vercel.app`
4. ✅ Frontend is live!

### **Step 6: Update Backend CORS**

Now we need to update the backend to allow requests from Vercel:

1. Go back to **Railway**
2. Go to **"Variables"**
3. Update `FRONTEND_URL`:
   ```bash
   FRONTEND_URL=https://nexusmind.vercel.app
   ```
4. Railway will auto-redeploy

**✅ Checkpoint:** Frontend deployed on Vercel!

---

## PART 4: Configure Custom Domain (Optional)

### **On Vercel:**

1. Go to your project → **"Settings"** → **"Domains"**
2. Add your custom domain (e.g., `nexusmind.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-30 minutes)

### **Update Backend:**

1. Update `FRONTEND_URL` in Railway to your custom domain
2. Redeploy

---

## PART 5: Database Setup

### **Run Migrations**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run these migrations in order:

**Migration 1: Initial Schema**
```sql
-- Copy content from backend/migrations/001_initial_schema.sql
-- Paste and run in Supabase SQL Editor
```

**Migration 2: Tags & Folders**
```sql
-- Copy content from backend/migrations/002_add_tags_and_folders.sql
-- Paste and run in Supabase SQL Editor
```

### **Verify Tables**

1. Go to **Table Editor**
2. You should see:
   - `notes` table
   - `folders` table
3. ✅ Database ready!

---

## PART 6: Test Your Deployment

### **Test Checklist:**

1. **Open your Vercel URL**
   - ✅ Page loads
   - ✅ No console errors

2. **Sign Up**
   - ✅ Create new account
   - ✅ Redirects to dashboard

3. **Create Note**
   - ✅ Create new note
   - ✅ Auto-save works
   - ✅ Note persists after refresh

4. **Create Folder**
   - ✅ Create folder
   - ✅ Assign note to folder
   - ✅ Filter by folder works

5. **Add Tags**
   - ✅ Add tags to note
   - ✅ Tag autocomplete works
   - ✅ Filter by tags works

6. **PWA**
   - ✅ Install prompt appears
   - ✅ Can install as app
   - ✅ Works offline

**✅ All tests pass? You're live!**

---

## 🔧 Troubleshooting

### **Frontend shows "Network Error"**

**Problem:** Can't connect to backend

**Solution:**
1. Check `VITE_API_URL` in Vercel environment variables
2. Make sure Railway backend is running
3. Check Railway logs for errors
4. Verify CORS settings in backend

### **Backend shows CORS error**

**Problem:** Frontend URL not allowed

**Solution:**
1. Update `FRONTEND_URL` in Railway
2. Make sure it matches your Vercel URL exactly
3. Include `https://` in the URL
4. Redeploy backend

### **Database connection fails**

**Problem:** Can't connect to Supabase

**Solution:**
1. Verify Supabase credentials in Railway
2. Check Supabase project is active
3. Verify RLS policies are enabled
4. Check Supabase logs

### **Build fails on Vercel**

**Problem:** Frontend build error

**Solution:**
1. Check build logs in Vercel
2. Verify `package.json` is correct
3. Make sure `frontend` is set as root directory
4. Try building locally: `npm run build`

### **AI features don't work**

**Problem:** AI endpoints return errors

**Solution:**
- AI features are optional
- For production, use Gemini API (not Ollama)
- Add `GEMINI_API_KEY` to Railway variables
- Or disable AI features for now

---

## 📊 Monitoring & Maintenance

### **Vercel Dashboard**

- **Analytics:** View page views, performance
- **Deployments:** See all deployments
- **Logs:** Check for errors
- **Domains:** Manage custom domains

### **Railway Dashboard**

- **Metrics:** CPU, memory usage
- **Logs:** Real-time backend logs
- **Deployments:** Deployment history
- **Variables:** Manage environment variables

### **Supabase Dashboard**

- **Database:** View tables, run queries
- **Auth:** Manage users
- **Logs:** Database query logs
- **Backups:** Automatic backups (Pro plan)

---

## 💰 Cost Breakdown

### **Free Tier Limits:**

**Vercel (Free):**
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Custom domains
- ✅ HTTPS included
- ✅ Preview deployments

**Railway (Free):**
- ✅ $5 credit/month
- ✅ ~500 hours runtime
- ✅ 1 GB RAM
- ✅ 1 GB storage

**Supabase (Free):**
- ✅ 500 MB database
- ✅ 50,000 monthly active users
- ✅ 2 GB file storage
- ✅ Unlimited API requests

**Total:** $0/month for small-medium usage!

### **When to Upgrade:**

**Vercel Pro ($20/month):**
- More bandwidth
- Better analytics
- Team collaboration

**Railway ($5-20/month):**
- More resources
- Better uptime
- Faster performance

**Supabase Pro ($25/month):**
- More database storage
- Daily backups
- Better support

---

## 🔄 Continuous Deployment

### **Automatic Deployments:**

**Vercel:**
- Pushes to `main` branch → Auto-deploy to production
- Pull requests → Preview deployments
- No configuration needed!

**Railway:**
- Pushes to `main` branch → Auto-deploy backend
- Automatic health checks
- Zero-downtime deployments

### **Deployment Workflow:**

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Vercel and Railway automatically deploy!
# Check deployment status in dashboards
```

---

## 🎯 Post-Deployment Checklist

- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Railway
- [ ] Database migrations run on Supabase
- [ ] Environment variables configured
- [ ] CORS configured correctly
- [ ] Custom domain added (optional)
- [ ] SSL certificate active (automatic)
- [ ] All features tested
- [ ] PWA install tested
- [ ] Monitoring set up
- [ ] Backups configured (Supabase)
- [ ] Team notified
- [ ] Documentation updated
- [ ] Launch! 🚀

---

## 📞 Support

**Issues?**
- Check deployment logs
- Review environment variables
- Test locally first
- Check service status pages

**Resources:**
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🎉 Congratulations!

Your NexusMind app is now live on:
- **Frontend:** https://nexusmind.vercel.app
- **Backend:** https://your-app.railway.app
- **Database:** Supabase (managed)

**Share it with the world!** 🌍

---

**Deployment Guide Version:** 1.0.0  
**Last Updated:** December 22, 2025  
**Estimated Time:** 30-45 minutes total

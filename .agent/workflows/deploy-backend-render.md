---
description: Deploy NexusMind Backend to Render (Free Tier)
---

# 🚀 Deploy NexusMind Backend to Render - Step by Step

This workflow guides you through deploying the NexusMind FastAPI backend to Render's free tier.

---

## Prerequisites

Before starting, ensure you have:
- [ ] GitHub account with NexusMind repository pushed
- [ ] Supabase project created with database tables
- [ ] Groq API key (get from https://console.groq.com)
- [ ] All environment variables ready

---

## Step 1: Prepare Your Repository

### 1.1: Verify Backend Structure
```bash
cd d:\Project\NexusMind\backend
```

### 1.2: Check Required Files Exist
```bash
ls main.py requirements.txt
```

You should see:
- `main.py` - FastAPI application entry point
- `requirements.txt` - Python dependencies

### 1.3: Test Locally (Optional but Recommended)
```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

Visit http://localhost:8000/docs to verify it works.

---

## Step 2: Push to GitHub

### 2.1: Initialize Git (if not already done)
```bash
cd d:\Project\NexusMind
git init
```

### 2.2: Add Remote Repository
```bash
# Replace with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/NexusMind.git
```

### 2.3: Commit and Push
```bash
git add .
git commit -m "Prepare backend for Render deployment"
git push -u origin main
```

---

## Step 3: Create Render Account & Service

### 3.1: Sign Up for Render
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended for easy repo access)
4. Authorize Render to access your GitHub repositories

### 3.2: Create New Web Service
1. Click "New +" button in top right
2. Select "Web Service"
3. Click "Connect account" if you haven't connected GitHub yet
4. Find and select your `NexusMind` repository
5. Click "Connect"

---

## Step 4: Configure Render Service

Fill in the following settings:

### Basic Settings:
- **Name**: `nexusmind-backend` (or your preferred name)
- **Region**: Select closest to your users (e.g., Oregon, Frankfurt, Singapore)
- **Branch**: `main`
- **Root Directory**: `backend`

### Build Settings:
- **Runtime**: `Python 3`
- **Build Command**: 
  ```
  pip install -r requirements.txt
  ```
- **Start Command**: 
  ```
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

### Instance Settings:
- **Instance Type**: `Free` (select the free tier)

---

## Step 5: Set Environment Variables

Click on "Environment" section and add these variables:

### Required Variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT Secret (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
JWT_SECRET_KEY=your-random-secret-key-here

# Frontend URL (update after deploying frontend)
FRONTEND_URL=http://localhost:5173

# Groq API for AI features
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### How to Get These Values:

**Supabase Keys:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_KEY`
   - service_role key → `SUPABASE_SERVICE_KEY`

**JWT Secret:**
Run this command locally:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Groq API Key:**
1. Go to https://console.groq.com
2. Sign up/login
3. Go to API Keys section
4. Create new key
5. Copy the key (starts with `gsk_`)

---

## Step 6: Deploy

1. Click "Create Web Service" button at the bottom
2. Wait for deployment (5-10 minutes)
3. Watch the build logs for any errors
4. Once deployed, you'll see "Live" status

Your backend URL will be:
```
https://nexusmind-backend.onrender.com
```

---

## Step 7: Verify Deployment

### 7.1: Test Health Endpoint
Open in browser or use curl:
```bash
curl https://nexusmind-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "api_version": "1.0.0"
}
```

### 7.2: Test API Documentation
Visit:
```
https://nexusmind-backend.onrender.com/docs
```

You should see the Swagger UI with all API endpoints.

### 7.3: Test Root Endpoint
```bash
curl https://nexusmind-backend.onrender.com/
```

Expected response:
```json
{
  "message": "NexusMind API is running",
  "version": "1.0.0",
  "docs": "/docs",
  "status": "healthy"
}
```

---

## Step 8: Update Frontend Configuration

After backend is deployed, update your frontend to use the new backend URL:

### 8.1: Update Frontend Environment Variable
In your frontend `.env` file:
```bash
VITE_API_URL=https://nexusmind-backend.onrender.com
```

### 8.2: Update Backend CORS
Go back to Render dashboard:
1. Click on your service
2. Go to "Environment" tab
3. Update `FRONTEND_URL` to your Vercel URL (after deploying frontend):
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
4. Click "Save Changes"
5. Service will auto-redeploy

---

## Step 9: Monitor Your Deployment

### View Logs:
1. Go to Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Monitor real-time logs

### Check Metrics:
1. Click "Metrics" tab
2. View CPU, Memory, Request metrics

---

## Important Notes About Free Tier

⚠️ **Cold Starts**: 
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Subsequent requests are fast

💡 **Solutions**:
1. Add a note in your app: "Backend may take 30s to wake up"
2. Use UptimeRobot (free) to ping your backend every 5 minutes
3. Upgrade to paid tier ($7/month) for always-on

⚠️ **Resource Limits**:
- 512MB RAM
- Shared CPU
- 750 hours/month (enough for 1 service running 24/7)

---

## Troubleshooting

### Build Failed
**Check**:
- `requirements.txt` is in the `backend` folder
- Root Directory is set to `backend`
- Python version compatibility

### Service Crashes
**Check logs for**:
- Missing environment variables
- Database connection errors
- Port binding issues (use `$PORT` variable)

### CORS Errors
**Verify**:
- `FRONTEND_URL` matches your frontend domain exactly
- No trailing slash in URL
- CORS middleware is configured in `main.py`

### Database Connection Failed
**Verify**:
- Supabase credentials are correct
- Supabase project is active
- Database tables are created

---

## Commands Quick Reference

### Generate JWT Secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Test Backend Locally:
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Test Deployed Backend:
```bash
# Health check
curl https://your-app.onrender.com/health

# Root endpoint
curl https://your-app.onrender.com/

# API docs (open in browser)
https://your-app.onrender.com/docs
```

### View Logs:
```bash
# In Render dashboard → Logs tab
# Or use Render CLI (optional):
render logs -s nexusmind-backend
```

---

## Next Steps

After backend deployment:
1. ✅ Test all endpoints via `/docs`
2. ✅ Deploy frontend to Vercel
3. ✅ Update CORS settings
4. ✅ Test full application flow
5. ✅ Set up monitoring (optional)

---

## Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **Render Docs**: https://render.com/docs
- **Your Backend**: https://nexusmind-backend.onrender.com
- **API Docs**: https://nexusmind-backend.onrender.com/docs
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Groq Console**: https://console.groq.com

---

**Deployment Complete! 🎉**

Your backend is now live and ready to serve requests!

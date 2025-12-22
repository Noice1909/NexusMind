# 🚀 Quick Deployment Reference

**30-Minute Deployment Checklist**

---

## ⚡ PART 1: GitHub (5 minutes)

```bash
cd D:\Project\NexusMind
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/nexusmind.git
git push -u origin main
```

---

## ⚡ PART 2: Railway Backend (10 minutes)

1. **Go to:** https://railway.app/
2. **New Project** → Deploy from GitHub → Select `nexusmind`
3. **Settings:**
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Variables:**
   ```
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   JWT_SECRET_KEY=random-32-char-string
   FRONTEND_URL=http://localhost:5173
   ```
5. **Deploy** → Copy Railway URL

---

## ⚡ PART 3: Vercel Frontend (10 minutes)

1. **Go to:** https://vercel.com/
2. **New Project** → Import `nexusmind` repo
3. **Settings:**
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variable:**
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```
5. **Deploy** → Copy Vercel URL

---

## ⚡ PART 4: Update Backend CORS (2 minutes)

1. **Railway** → Variables → Update:
   ```
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ```
2. Auto-redeploys

---

## ⚡ PART 5: Database Migrations (3 minutes)

1. **Supabase** → SQL Editor
2. Run `backend/migrations/001_initial_schema.sql`
3. Run `backend/migrations/002_add_tags_and_folders.sql`

---

## ✅ DONE!

**Your URLs:**
- Frontend: https://nexusmind.vercel.app
- Backend: https://nexusmind.railway.app
- Database: Supabase (managed)

**Total Time:** ~30 minutes  
**Total Cost:** $0/month

---

## 🔧 Quick Troubleshooting

**Frontend can't connect to backend:**
- Check `VITE_API_URL` in Vercel
- Check `FRONTEND_URL` in Railway
- Both should match exactly

**Database errors:**
- Verify Supabase credentials
- Check migrations ran successfully
- Verify RLS policies enabled

**Build fails:**
- Check logs in Vercel/Railway
- Verify environment variables
- Test build locally first

---

**Need detailed instructions?** See `VERCEL_DEPLOYMENT.md`

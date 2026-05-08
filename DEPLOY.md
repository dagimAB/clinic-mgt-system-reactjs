# 🚀 Quick Deployment Guide (Vercel + Render + Neon)

This is the fastest path to deploy SHMS to production using **Vercel** (frontend), **Render** (backend), and **Neon** (PostgreSQL database).

## Prerequisites

1. GitHub account with this repo pushed
2. Vercel account (free tier)
3. Render account (free tier)
4. Neon account (free tier) — https://neon.tech

## 0️⃣ Set Up Database on Neon (2 minutes)

1. Go to https://neon.tech
2. Sign up with GitHub (easiest)
3. Create a new project:
   - **Project name:** `shms-db`
   - **Database name:** `healthcare`
   - **Region:** Pick closest to your backend region (Oregon)
4. Wait for the database to initialize
5. Go to "Connection String" and copy the PostgreSQL connection URL
   - Format: `postgresql://user:password@host:5432/healthcare`
6. Save this connection string — you'll use it for Render and Vercel

## 1️⃣ Deploy Backend to Render (5 minutes)

### Option A: One-Click (Easiest)

```bash
# Use this URL (replace YOUR_REPO_URL with your GitHub repo URL):
https://render.com/deploy?repo=YOUR_REPO_URL
```

When prompted for environment variables, fill in from your Neon connection string:

- `PG_HOST` → host from Neon
- `PG_USER` → postgres
- `PG_PASSWORD` → password from Neon
- `PG_DATABASE` → healthcare
- `PG_PORT` → 5432
- `PG_SSL` → true
- `CORS_ORIGIN` → (leave empty for now, update after Vercel deploy)

### Option B: Manual

1. Go to https://render.com → New Web Service
2. Connect your GitHub repo
3. Configuration:
   - **Name:** `shms-backend`
   - **Build:** `npm install`
   - **Start:** `npm run start:render`
   - **Environment variables:**
     ```
     NODE_ENV=production
     PORT=3007
     PG_HOST=<from Neon>
     PG_USER=postgres
     PG_PASSWORD=<from Neon>
     PG_DATABASE=healthcare
     PG_PORT=5432
     PG_SSL=true
     KEY=<generate a secure 32+ char key>
     CORS_ORIGIN= (update after Vercel deploy)
     ```
4. Deploy

After deploy, note your backend URL: `https://shms-backend.onrender.com`

## 2️⃣ Deploy Frontend to Vercel (3 minutes)

1. Go to https://vercel.com/new
2. Import this GitHub repo
3. **Root Directory:** Select `FrontEnd`
4. Add environment variable:
   ```
   REACT_APP_BASE_URL=https://shms-backend.onrender.com
   ```
5. Deploy

After deploy, note your frontend URL: `https://shms-frontend.vercel.app`

## 3️⃣ Update Backend CORS (1 minute)

Go to Render backend environment variables and update:

```
CORS_ORIGIN=https://shms-frontend.vercel.app
```

Save and your backend will auto-restart.

## 4️⃣ Test

1. Open https://shms-frontend.vercel.app
2. Try logging in with:
   - Email: `admin@aastu.edu.et`
   - Password: `12345678` (default from seed)

## 🐛 Troubleshooting

### "Frontend can't reach backend"

- Check `CORS_ORIGIN` in Render backend environment is set correctly
- Verify `REACT_APP_BASE_URL` in Vercel environment matches your Render backend URL
- Trigger a redeploy on Vercel after updating env vars

### "Database connection failed"

- Verify `PG_HOST`, `PG_USER`, `PG_PASSWORD` match your Neon connection string exactly
- Check that Neon project is still active (not suspended)
- Ensure `PG_SSL=true` is set

### "Database tables missing"

- Check Render backend logs for initialization errors
- Manually run from Render shell: `node createTable.js`
- If that fails, check database connection first

### "Login fails"

- Ensure backend database initialized (check logs)
- Try default admin: `ADM-001` / `12345678`

## 📖 Full Documentation

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for:

- Detailed manual setup steps
- Environment variable reference
- Multiple deployment options (Railway, AWS, DigitalOcean, etc.)
- Advanced troubleshooting

## 🔧 Configuration

- **Backend**: [Backend/.env.example](./Backend/.env.example)
- **Frontend**: [FrontEnd/.env.example](./FrontEnd/.env.example)
- **Render Config**: [render.yaml](./render.yaml)
- **Vercel Config**: [FrontEnd/vercel.json](./FrontEnd/vercel.json)

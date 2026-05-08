# ========================================

# SHMS Deployment Guide

# ========================================

# This guide provides step-by-step instructions

# to deploy the SHMS application to various

# cloud platforms.

#

# RECOMMENDED STACK (FASTEST):

# - Frontend: Vercel

# - Backend: Render

# - Database: Neon PostgreSQL

#

# OTHER PLATFORMS COVERED:

# 1. Railway.app

# 2. DigitalOcean

# 3. AWS

# 4. Docker Hub + Manual Deployment

# ========================================

## BEFORE YOU START

1. **Create GitHub Repository**

   ```bash
   cd clinic-mgt-system
   git init
   git add .
   git commit -m "Initial SHMS setup"
   git remote add origin https://github.com/YOUR_USERNAME/clinic-mgt-system.git
   git push -u origin main
   ```

2. **Generate Secure Credentials**
   - Create strong JWT key (32+ characters)
   - Get OpenRouter API key (optional, for AI features)

3. **Create Accounts (Free Tier)**
   - Neon: https://neon.tech (PostgreSQL database)
   - Render: https://render.com (Backend API)
   - Vercel: https://vercel.com (Frontend)

4. **Test Locally First**
   ```bash
   docker-compose up
   # Visit http://localhost:3007 and http://localhost:3000
   ```

---

## ⭐ RECOMMENDED: VERCEL + RENDER + NEON (EASIEST)

**See [DEPLOY.md](./DEPLOY.md) for the quick 5-step guide.**

This stack provides:

- ✅ Free tier for all three services
- ✅ Auto-deploy from GitHub (Vercel & Render)
- ✅ Managed PostgreSQL (Neon)
- ✅ Automatic table initialization on first boot
- ✅ Best separation of concerns

### Quick Path

```bash
# 1. Set up Neon database (2 min)
# 2. Deploy backend to Render (5 min)
# 3. Deploy frontend to Vercel (3 min)
# 4. Update CORS origin (1 min)
# Total: ~11 minutes
```

---

## OPTION 1: RENDER.COM (WITH NEON DATABASE)

### Why This Stack?

- ✅ Free tier available on all services
- ✅ Auto-deploy from GitHub
- ✅ Built-in PostgreSQL
- ✅ Environment variables UI
- ✅ Simple scaling
- ✅ One-click deployment
- ✅ Automated database table initialization

### ⚡ Quick Start (render.yaml)

**NEW:** This repo includes a `render.yaml` file that automates most of the setup!

1. Push this repo to GitHub
2. Go to https://render.com/deploy?repo=YOUR_GITHUB_REPO_URL (replace YOUR_GITHUB_REPO_URL with your actual repo)
3. Follow the prompts to authorize with GitHub
4. Render will automatically:
   - Create a PostgreSQL database
   - Create the backend service
   - Configure all environment variables
   - Initialize database tables on first boot
5. After deployment, update `CORS_ORIGIN` in the backend environment variables to point to your Vercel frontend

✅ **Done!** Your backend is live.

### Step-by-Step (Manual Setup)

If you prefer manual setup instead of using render.yaml:

#### 1. Create Render Account

- Go to https://render.com
- Sign up with GitHub (easiest)

#### 2. Create PostgreSQL Database

- Dashboard → New+ → PostgreSQL
- **Name:** `shms-db`
- **Database:** `healthcare`
- **User:** `postgres`
- **Copy the connection string** (you'll need it)

#### 3. Create Backend Web Service

- Dashboard → New+ → Web Service
- **Select:** Deploy from GitHub
- **Connect your repo:** `clinic-mgt-system`
- **Configuration:**
  - Name: `shms-backend`
  - Environment: `Node`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Branch: `main`
  - Plan: `Free` (or paid for production)

#### 4. Add Backend Environment Variables

- In Web Service settings → Environment
- Add these variables:
  ```
  NODE_ENV=production
  PORT=3007
  PG_HOST=<from PostgreSQL connection string>
  PG_USER=postgres
  PG_PASSWORD=<from PostgreSQL connection string>
  PG_DATABASE=healthcare
  PG_PORT=5432
  PG_SSL=true
  KEY=<your-secure-32-char-key>
  OPENROUTER_API_KEY=<your-api-key-or-empty>
  ```

#### 5. Deploy Backend

- Click "Deploy" → wait 3-5 minutes
- Check "http://shms-backend.onrender.com" (you'll get a custom URL)

#### 6. Run Database Migrations

- In Render dashboard, open your backend's shell
- Run: `node createTable.js`
- Run: `node seed.js`

#### 7. Create Frontend Web Service

- Dashboard → New+ → Web Service
- **Select:** `clinic-mgt-system` GitHub repo
- **Configuration:**
  - Name: `shms-frontend`
  - Environment: `Docker`
  - Build Command: empty (uses Dockerfile)
  - Start Command: empty (uses Dockerfile)
  - Branch: `main`

#### 8. Add Frontend Environment Variables

```
REACT_APP_BASE_URL=https://shms-backend.onrender.com
VITE_APP_BASE_URL=https://shms-backend.onrender.com
CI=false
```

#### 8b. Allow the Vercel frontend in the backend CORS list

```
CORS_ORIGIN=https://shms-frontend.vercel.app
```

#### 9. Deploy Frontend

- Click "Deploy" → wait 5-7 minutes
- Access frontend at `https://shms-frontend.onrender.com`

#### 10. Test

- ✅ Login with admin: `ADM-001` / (password from seed)
- ✅ Check AI features if OpenRouter key added
- ✅ Try creating appointments, viewing queue, etc.

### URL After Deployment

```
Frontend: https://shms-frontend.onrender.com
Backend:  https://shms-backend.onrender.com
Database: Managed by Render (no direct access needed)
```

---

## ⭐ OPTION 2: RAILWAY.APP

### Why Railway?

- ✅ Very developer-friendly
- ✅ Auto-deploy from GitHub
- ✅ PostgreSQL built-in
- ✅ Free credits ($5)
- ✅ Simple UI

### Step-by-Step

#### 1. Create Railway Account

- Go to https://railway.app
- Sign up with GitHub

#### 2. Create New Project

- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose `clinic-mgt-system`

#### 3. Add PostgreSQL

- Click "Add Service"
- Select "PostgreSQL"
- Railway auto-configures credentials

#### 4. Configure Backend Service

- Click "New Service"
- Select "Docker"
- Railway detects `Backend/Dockerfile`
- Variables auto-filled from GitHub

#### 5. Set Environment Variables

- Click on Backend service
- Variables tab
- Add:
  ```
  NODE_ENV=production
  PORT=3007
  KEY=<your-secure-key>
  OPENROUTER_API_KEY=<your-key>
  ```
- PostgreSQL variables auto-linked

#### 6. Configure Frontend Service

- Click "New Service"
- Select "Docker"
- Railway detects `FrontEnd/Dockerfile`

#### 7. Deploy

- Click "Deploy"
- Railway auto-deploys when you push to GitHub

#### 8. Run Migrations

- Click Backend service → "Connect"
- Run shell commands:
  ```bash
  node createTable.js
  node seed.js
  ```

### URL After Deployment

```
Generated automatically by Railway
Example: https://your-project.railway.app
```

---

## ⭐ OPTION 3: DIGITALOCEAN APP PLATFORM

### Why DigitalOcean?

- ✅ More control than Render/Railway
- ✅ Good pricing ($12+)
- ✅ Docker support
- ✅ Managed PostgreSQL
- ✅ Great documentation

### Step-by-Step

#### 1. Create DigitalOcean Account

- Go to https://www.digitalocean.com
- Sign up with GitHub

#### 2. Create App

- Apps → Create App
- Select GitHub repo
- Choose `clinic-mgt-system`

#### 3. Configure Services

- **Service 1: Backend**
  - Source: `Backend/Dockerfile`
  - HTTP Port: `3007`
- **Service 2: Frontend**
  - Source: `FrontEnd/Dockerfile`
  - HTTP Port: `3000`

- **Service 3: Database**
  - DigitalOcean Managed PostgreSQL
  - Set database name to `healthcare`

#### 4. Set Environment Variables

- For Backend:
  ```
  NODE_ENV=production
  KEY=<your-secure-key>
  OPENROUTER_API_KEY=<optional>
  ```

#### 5. Deploy

- Click "Deploy"
- Wait for all services to start

#### 6. Access Application

```
Backend:  https://backend-xxx.ondigitalocean.app
Frontend: https://frontend-xxx.ondigitalocean.app
```

---

## ⭐ OPTION 4: AWS EC2 + RDS (Most Control)

### Why AWS?

- ✅ Maximum control
- ✅ Production-grade infrastructure
- ✅ Pay-as-you-go pricing
- ✅ Scales infinitely
- ⚠️ Most complex setup

### Prerequisites

- AWS account with billing setup
- Basic Linux knowledge
- SSH key pair created

### Step-by-Step

#### 1. Create RDS PostgreSQL Instance

- AWS Console → RDS → Create Database
- Engine: PostgreSQL 15
- Instance: `db.t3.micro` (free tier eligible)
- Storage: 20 GB
- DB name: `healthcare`
- Master username: `postgres`
- Master password: (create strong password)
- Public accessibility: No (for security)
- VPC Security Group: Allow port 5432 from EC2

#### 2. Launch EC2 Instance

- AWS Console → EC2 → Launch Instance
- AMI: Ubuntu 22.04 LTS (free tier eligible)
- Instance type: `t3.micro`
- Key pair: (create or select)
- Security group: Allow SSH (22), HTTP (80), HTTPS (443), 3007
- Storage: 30 GB

#### 3. SSH into EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

#### 4. Install Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install nginx (reverse proxy)
sudo apt install -y nginx

# Install Docker (optional, for containers)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### 5. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/clinic-mgt-system.git
cd clinic-mgt-system
```

#### 6. Setup Backend

```bash
cd Backend
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=3007
PG_HOST=your-rds-endpoint.amazonaws.com
PG_USER=postgres
PG_PASSWORD=your-secure-password
PG_DATABASE=healthcare
PG_PORT=5432
PG_SSL=true
KEY=your-secure-jwt-key
EOF

# Run migrations
node createTable.js
node seed.js

# Start with PM2
pm2 start index.js --name "shms-backend"
pm2 startup
pm2 save
```

#### 7. Setup Frontend

```bash
cd ../FrontEnd
npm install

# Create .env file
cat > .env << EOF
REACT_APP_BASE_URL=http://your-ec2-public-ip:3007
CI=false
EOF

# Build
npm run build

# Copy to nginx
sudo cp -r build /var/www/shms-frontend
```

#### 8. Configure nginx

```bash
sudo nano /etc/nginx/sites-available/default
```

Add this config:

```nginx
upstream backend {
    server 127.0.0.1:3007;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Backend proxy
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        root /var/www/shms-frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

Then:

```bash
sudo systemctl restart nginx
```

#### 9. Access Application

```
Frontend: http://your-ec2-public-ip
Backend:  http://your-ec2-public-ip/api
```

---

## 🐳 OPTION 5: DOCKER DEPLOYMENT

### Build and Push to Docker Hub

#### 1. Create Docker Hub Account

- Go to https://hub.docker.com
- Sign up
- Create repository named `shms-backend`

#### 2. Build and Push

```bash
# Build
docker build -t your-username/shms-backend:1.0 ./Backend

# Push
docker login
docker push your-username/shms-backend:1.0
```

#### 3. Deploy from Docker Hub

- Most cloud platforms support deploying from Docker Hub
- Use image: `your-username/shms-backend:1.0`

---

## ✅ POST-DEPLOYMENT CHECKLIST

- [ ] Backend API responds (check `/` endpoint)
- [ ] Frontend loads
- [ ] Database connected (check logs)
- [ ] Default admin exists (ADM-001)
- [ ] Login works
- [ ] AI features work (if API key added)
- [ ] HTTPS enabled
- [ ] Database backups configured
- [ ] Error monitoring setup (e.g., Sentry)
- [ ] Rate limiting configured

---

## 🔒 SECURITY CHECKLIST

- [ ] Change default admin password
- [ ] Use strong JWT key (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Use environment variables for all secrets
- [ ] Database not publicly accessible
- [ ] Regular backups scheduled
- [ ] Monitor application logs
- [ ] Setup firewall rules
- [ ] Update dependencies regularly

---

## 📊 MONITORING & LOGS

### Render

```bash
# View logs in dashboard or:
tail -f logs
```

### Railway

```bash
# View logs in dashboard
# Or use CLI:
railway logs
```

### AWS EC2

```bash
# Backend logs
pm2 logs

# System logs
tail -f /var/log/syslog
```

### Docker

```bash
docker-compose logs -f backend
```

---

## 🆘 TROUBLESHOOTING

### Issue: Database connection failed

**Solutions:**

- Check PG_HOST, PG_USER, PG_PASSWORD
- Verify security groups allow connection
- Ensure database is running
- Check PG_SSL setting

### Issue: "relation ... does not exist"

**Solution:**

- Run `node createTable.js` in deployment environment

### Issue: Frontend can't reach backend

**Solutions:**

- Check REACT_APP_BASE_URL is correct
- Verify CORS enabled in backend
- Check firewall rules
- Verify backend is running

### Issue: Authentication fails

**Solutions:**

- Check JWT KEY is set correctly
- Verify admin exists: `node seed.js`
- Check token expiry

### Issue: AI chat not working

**Solutions:**

- Check OPENROUTER_API_KEY is set
- Verify API key has quota
- Check model name

---

## 📚 RESOURCES

- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app
- DigitalOcean Docs: https://docs.digitalocean.com
- AWS Docs: https://docs.aws.amazon.com
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Docker Docs: https://docs.docker.com/

---

## NEXT STEPS

1. ✅ Choose a platform (recommend **Render** for learning)
2. ✅ Follow the step-by-step guide
3. ✅ Test the application
4. ✅ Setup monitoring
5. ✅ Configure auto-backups
6. ✅ Setup custom domain (optional)

Good luck with your deployment! 🚀

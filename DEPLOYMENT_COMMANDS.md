# 🚀 Deployment Commands - Step-by-Step

## **Pre-Deployment (Local)**

### Verify All Changes Are Correct

```bash
# Navigate to project root
cd feesportal

# Check git status
git status

# Should show modified files:
# backend/api/index.js
# backend/vercel.json
# backend/.env
# backend/.env.example
# frontend/.env
# frontend/src/api/axios.js

# Verify backend/server.js exists
ls -la backend/server.js  # or 'dir backend\server.js' on Windows

# Check CORS configuration
cat backend/api/index.js | grep -A5 "trust proxy"

# Check environment variables
cat backend/.env
cat frontend/.env
```

### Commit Changes to Git

```bash
# Stage all changes
git add .

# Commit with message
git commit -m "Fix: Production CORS configuration for Vercel deployment

- Added trust proxy configuration for Vercel
- Enhanced CORS origin validation and logging
- Added explicit OPTIONS preflight handler
- Updated backend entry point in vercel.json
- Added FRONTEND_URL environment variable
- Improved axios interceptors with logging
- Added detailed error handling for CORS issues"

# Verify commit
git log -1

# Push to GitHub
git push origin main
```

---

## **Phase 1: Backend Deployment to Vercel**

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to backend
cd backend

# Deploy to production
vercel --prod

# This will:
# 1. Ask for project name/settings
# 2. Deploy code to Vercel
# 3. Give you the production URL
# Save this URL for next step!
```

### Option B: Using Vercel Dashboard (Web UI)

```
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your GitHub repository (feesportal)
4. When prompted:
   - Root Directory: backend
   - Framework: Other (Node.js)
   - Build Command: npm install
   - Output Directory: (leave blank)
5. Click "Deploy"
6. Go to Settings → Environment Variables
7. Add each variable (see table below)
8. After adding variables, go to Deployments and Redeploy
```

### Add Environment Variables on Vercel

**Using Vercel CLI:**

```bash
# From backend directory
vercel env add MONGO_URI
# Paste: mongodb+srv://Vercel-Admin-feesportaldb:56Rsw33mBjnFli6z@feesportaldb.lejqj4s.mongodb.net/test?retryWrites=true&w=majority

vercel env add MONGODB_URI
# Paste: mongodb+srv://Vercel-Admin-feesportaldb:56Rsw33mBjnFli6z@feesportaldb.lejqj4s.mongodb.net/test?retryWrites=true&w=majority

vercel env add JWT_SECRET
# Paste: your_very_long_secret_key_here_32_chars_minimum

vercel env add FRONTEND_URL
# Paste: https://feesportal.vercel.app

vercel env add NODE_ENV
# Paste: production
```

**Using Vercel Dashboard:**

1. Open your backend project in Vercel
2. Go to **Settings**
3. Click **Environment Variables**
4. Click **"Add New Environment Variable"**
5. Enter each of:
   - Name: MONGO_URI
     Value: `mongodb+srv://Vercel-Admin-feesportaldb:56Rsw33mBjnFli6z@feesportaldb.lejqj4s.mongodb.net/test?retryWrites=true&w=majority`
     Scope: **Production**
   
   - Name: MONGODB_URI
     Value: *(same as MONGO_URI)*
     Scope: **Production**
   
   - Name: JWT_SECRET
     Value: *(your 32+ char secret)*
     Scope: **Production**
   
   - Name: FRONTEND_URL
     Value: `https://feesportal.vercel.app`
     Scope: **Production**
   
   - Name: NODE_ENV
     Value: `production`
     Scope: **Production**

### Redeploy Backend with Environment Variables

```bash
# Using Vercel CLI
vercel deploy --prod

# OR go to Vercel Dashboard:
# Deployments → Latest → Click deployment → Redeploy
```

### Verify Backend Deployment

```bash
# Get your backend URL from:
# https://vercel.com/dashboard → your-backend-project → Deployments

# Test backend health
curl https://feesportal-backend-YOUR-ID.vercel.app/
# Expected: {"ok":true,"name":"Fees Portal API"}

# Test CORS headers
curl -i -X OPTIONS \
  https://feesportal-backend-YOUR-ID.vercel.app/api/auth/login \
  -H "Origin: https://feesportal.vercel.app" \
  -H "Access-Control-Request-Method: POST"
# Expected: 200 OK with CORS headers

# View logs
vercel logs
# Look for: "✅ CORS Allowed Origins: [...]"
```

**Save your backend URL!**
```
Example: https://feesportal-backend-abc123def.vercel.app
```

---

## **Phase 2: Update Frontend with Backend URL**

### Update Frontend Environment

```bash
# Navigate to frontend
cd ../frontend

# Edit .env file - update the backend URL
# Change: VITE_API_URL=https://feesportal-backend.vercel.app
# To:     VITE_API_URL=https://feesportal-backend-abc123def.vercel.app
# (Use the actual URL from previous step)

# Verify the change
cat .env
```

### Commit Frontend Changes

```bash
# From project root
git add frontend/.env

git commit -m "Config: Update backend API URL for production deployment"

git push origin main
```

---

## **Phase 3: Frontend Deployment to Vercel**

### Using Vercel CLI

```bash
# Navigate to frontend
cd frontend

# Deploy to production
vercel --prod

# This will:
# 1. Ask for project name/settings (can use same repo)
# 2. Suggest buildCommand: npm run build
# 3. Suggest output directory: dist
# 4. Deploy and give you the production URL
```

### Using Vercel Dashboard

```
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your GitHub repository (feesportal)
4. When prompted:
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist
5. Click "Deploy"
```

### Verify Frontend Deployment

```bash
# Get your frontend URL from Vercel Dashboard
# Example: https://feesportal-abc123.vercel.app

# Open in browser
# https://feesportal-abc123.vercel.app/

# Check DevTools Console
# Should see: "🔌 API Configuration"
# Should NOT see red errors
```

---

## **Phase 4: Complete Verification**

### Test Login (Production)

```bash
# In browser (https://feesportal.vercel.app):
# 1. Open DevTools (F12)
# 2. Go to Console tab
# 3. Go to Network tab
# 4. Try to login with admin/admin123
# 5. Look for "auth/login" in Network tab
#    Should show 200 OK (not CORS error)
```

### Verify Backend Logs

```bash
# Check backend logs
# In Vercel Dashboard:
# - Select backend project
# - Deployments → Latest deployment
# - Click on it → Logs tab
# - Look for lines like:
#   "POST /api/auth/login 200 123ms"
```

### Final Health Check

```bash
# Test complete flow
curl -X POST \
  https://feesportal-backend-YOUR-ID.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Expected response:
# {"token":"eyJ0eXAi...","username":"admin"}
```

---

## **Rollback Commands (If Needed)**

### Redeploy Previous Version

```bash
# Go to Vercel Dashboard
# Project → Deployments → Find previous working deployment → Click → Redeploy

# OR using CLI:
vercel rollback
```

### Revert Git Changes

```bash
# Go back to last working commit
git log --oneline
# Find the commit hash

# Reset to that commit
git reset --hard COMMIT_HASH
git push origin main --force
```

---

## **Troubleshooting Commands**

### Check Backend Health

```bash
# Is backend running?
curl https://feesportal-backend-YOUR-ID.vercel.app/ -v

# Check specific endpoint
curl https://feesportal-backend-YOUR-ID.vercel.app/api/areas

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://feesportal-backend-YOUR-ID.vercel.app/api/students
```

### Check Frontend Build

```bash
# Check if frontend built successfully
# In Vercel Dashboard: Deployments → Click latest → Look for build output

# Rebuild frontend
cd frontend
npm run build

# Test build locally
npm run preview
# Should run on http://localhost:4173
```

### Generate Strong JWT_SECRET

```bash
# Generate 32-character random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Then update in Vercel:
vercel env add JWT_SECRET
# or manually in Dashboard Settings → Environment Variables
```

### View Vercel Project URL

```bash
# See all your Vercel projects
vercel projects

# See current project details
vercel projects info

# Get backend URL
vercel env list

# Get full deployment info
vercel deployments
```

---

## **Post-Deployment Monitoring**

### Monitor Backend Logs

```bash
# Stream live logs
vercel logs --follow

# Check last N lines
vercel logs --lines 100

# Filter logs
vercel logs | grep "error"
vercel logs | grep "auth"
```

### Check Deployment Status

```bash
# View all deployments
vercel deployments

# Check specific deployment
vercel deployments info DEPLOYMENT_ID

# Get build time
vercel projects info
```

### Database Connection Status

```bash
# Check if MongoDB is accessible
# In backend logs: should see "✅ MongoDB Connected"

# If connection fails, check:
# 1. MONGO_URI is correct in Vercel env vars
# 2. MongoDB Atlas IP whitelist includes 0.0.0.0/0
# 3. Database credentials are correct
```

---

## **Performance Optimization**

```bash
# After deployment, optimize:

# 1. Enable caching for frontend static assets
# In Vercel Dashboard: Project → Settings → Build & Development Settings
# Set "Functions" memory: 1024 MB (if needed)

# 2. Monitor cold starts
# In Vercel Dashboard: Analytics → Serverless Functions
# Look for cold start latency

# 3. Set up error monitoring (optional)
# vercel/analytics-package in your code
```

---

## **Complete Checklist**

### Before Deployment
- [ ] All code changes committed
- [ ] `.env` files NOT committed
- [ ] `backend/server.js` exists
- [ ] `backend/vercel.json` points to `server.js`
- [ ] Frontend has backend URL
- [ ] No local errors when running

### Backend Deployment
- [ ] Backend project created on Vercel
- [ ] All 5 environment variables set
- [ ] Backend deployed successfully
- [ ] Backend URL accessible
- [ ] CORS preflight test passes

### Frontend Deployment
- [ ] `frontend/.env` updated with actual backend URL
- [ ] Frontend project created on Vercel
- [ ] Frontend deployed successfully
- [ ] Frontend loads without 404

### Production Verification
- [ ] Login page loads
- [ ] Login request succeeds (200 OK)
- [ ] Dashboard loads after login
- [ ] All API calls work
- [ ] No CORS errors in console

---

**If all checks pass, you're ready to go! 🎉**

For detailed help, see:
- [PRODUCTION_CORS_FIX.md](PRODUCTION_CORS_FIX.md) - Detailed guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Full verification steps
- [CODE_ANALYSIS.md](CODE_ANALYSIS.md) - Technical explanation


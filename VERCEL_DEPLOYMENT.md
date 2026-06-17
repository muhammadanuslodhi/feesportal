# Vercel Deployment Guide

## 🎯 Overview

Your application consists of:
- **Backend**: Express API with MongoDB Atlas (Vercel Serverless Functions)
- **Frontend**: React + Vite (Vercel Static Hosting)

Both will be deployed to Vercel and can communicate via CORS.

---

## 📋 Prerequisites

1. **Vercel Account**: https://vercel.com (sign up with GitHub)
2. **GitHub Repository**: Push your code to GitHub
3. **MongoDB Atlas Account**: https://www.mongodb.com/cloud/atlas
4. **Environment Variables**: Prepared and ready

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare GitHub Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Setup MongoDB, CORS, and Vercel configuration"
git push origin main
```

---

### Step 2: Deploy Backend to Vercel

#### 2.1 Create Backend Project on Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select your GitHub repository
4. Choose **"feesportal"** (or your repo name)
5. Click **"Import"**

#### 2.2 Configure Build & Output Settings

**Root Directory:**
```
backend
```

**Build Command:**
```
npm install
```

**Output Directory:**
```
api
```

**Install Command:**
```
npm ci
```

#### 2.3 Add Environment Variables

Go to **Settings** → **Environment Variables** and add:

```
MONGO_URI=mongodb+srv://Vercel-Admin-feesportaldb:56Rsw33mBjnFli6z@feesportaldb.lejqj4s.mongodb.net/feesportal?retryWrites=true&w=majority

JWT_SECRET=your_very_long_secret_key_here_min_32_characters

FRONTEND_URL=https://feesportal.vercel.app

NODE_ENV=production
```

**Get your actual credentials from MongoDB Atlas:**
1. Go to MongoDB Atlas Clusters
2. Click "Connect" → "Connect your application"
3. Copy the full connection string
4. Replace `<password>` with your database user password

#### 2.4 Deploy

Click **"Deploy"** button

✅ You'll get a URL like: `https://feesportal-backend-xyz123.vercel.app`

**⚠️ Important:** Save this URL for the frontend configuration!

---

### Step 3: Deploy Frontend to Vercel

#### 3.1 Update Frontend Environment

Before deploying, update `frontend/.env`:

```env
VITE_API_URL=https://feesportal-backend-xyz123.vercel.app
```

Replace `feesportal-backend-xyz123` with your actual backend domain from Step 2.4

#### 3.2 Create Frontend Project on Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**  
3. Select your GitHub repository
4. Choose **"feesportal"** (or your repo name)
5. Click **"Import"**

#### 3.3 Configure Build Settings

**Root Directory:**
```
frontend
```

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm ci
```

#### 3.4 Add Environment Variables

Go to **Settings** → **Environment Variables** and add:

```
VITE_API_URL=https://feesportal-backend-xyz123.vercel.app
```

#### 3.5 Deploy

Click **"Deploy"** button

✅ You'll get a URL like: `https://feesportal.vercel.app`

---

## ✅ Post-Deployment Steps

### 1. Update Backend CORS

Your frontend will be deployed to `https://feesportal.vercel.app`, which is already configured in backend's CORS. ✓

### 2. Test the Connection

1. Go to `https://feesportal.vercel.app`
2. Try to login with test credentials: `admin` / `admin123`
3. Check DevTools → Network tab for any errors

### 3. Verify MongoDB Connection

The backend will automatically try to connect to MongoDB Atlas. On production:
- ✓ Vercel servers have unrestricted internet access
- ✓ MongoDB Atlas accepts connections from anywhere (if IP whitelist is configured)
- ✓ Your local network restrictions don't apply

**MongoDB Atlas IP Whitelist:**
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (for production)
4. Click "Confirm"

---

## 🔧 Troubleshooting

### Issue: Frontend can't reach backend

**Solution:**
1. Check `frontend/.env` has correct `VITE_API_URL`
2. Verify backend URL is accessible: `curl https://your-backend-url/`
3. Check backend CORS settings in `backend/api/index.js`

### Issue: Login fails with 401

**Solution:**
1. Check JWT_SECRET matches between environment variables
2. Verify MongoDB connection is working
3. Check browser console for full error message

### Issue: "MongoDB connection failed" on production

**Solution:**
1. Check MongoDB Atlas IP whitelist includes Vercel
2. Verify MONGO_URI environment variable is set correctly
3. Check MongoDB Atlas credentials are correct

### Issue: Build fails

**Solution:**
1. Check build command matches your setup
2. Verify all dependencies are in `package.json`
3. Check for syntax errors in code

---

## 📊 Monitoring

### Backend Logs

View in Vercel Dashboard:
1. Select backend project
2. Go to **"Deployments"**
3. Click latest deployment
4. Click **"Logs"** tab

### Frontend Logs

View in Vercel Dashboard:
1. Select frontend project
2. Go to **"Deployments"**
3. Click latest deployment
4. See build output and logs

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** (use environment variables on Vercel)
2. **Keep JWT_SECRET secret** (regenerate if compromised)
3. **Use strong database passwords**
4. **Enable MongoDB IP whitelist** (or restrict to Vercel IPs)
5. **Use HTTPS** (automatic with Vercel)

---

## 📝 Summary of URLs

After deployment:

| Service | URL |
|---------|-----|
| Frontend | `https://feesportal.vercel.app` |
| Backend API | `https://feesportal-backend-xyz123.vercel.app` |
| MongoDB Atlas | `https://cloud.mongodb.com/...` |

---

## ⚡ Quick Reference Commands

**Local Development:**
```bash
# Backend with mock database
cd backend && npm run dev:mock

# Frontend development
cd frontend && npm run dev

# Test MongoDB connection
cd backend && npm run test-mongo
```

**Production Build:**
```bash
# Backend
cd backend && npm run build

# Frontend  
cd frontend && npm run build
```

---

## 🎉 Success Checklist

- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set correctly
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Frontend can reach backend API
- [ ] Login works with test credentials
- [ ] No CORS errors in console
- [ ] Database operations successful

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Express CORS**: https://github.com/expressjs/cors
- **Vite**: https://vitejs.dev/guide/


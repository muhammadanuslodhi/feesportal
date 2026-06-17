# CORS & Environment Setup Guide

## 🔧 What Was Fixed

### Backend (`/backend/api/index.js`)
✓ Updated CORS configuration to explicitly allow:
- `http://localhost:3000` (local frontend)
- `http://localhost:5173` (local Vite frontend)
- `https://feesportal.vercel.app` (production frontend)
- Any URL in `FRONTEND_URL` environment variable

✓ Enabled credentials and required headers for authentication

### Frontend (`.env`)
✓ Fixed `VITE_API_URL` format to work with axios interceptor
- **OLD**: `VITE_API_URL=https://your-backend.vercel.app/api` ❌ (double /api)
- **NEW**: `VITE_API_URL=https://your-backend.vercel.app` ✓

## 📋 Environment Setup

### Backend `.env`
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/feesportal
JWT_SECRET=your_long_random_secret_key_here
FRONTEND_URL=https://feesportal.vercel.app
PORT=5000
```

### Frontend `.env`
```
VITE_API_URL=https://your-backend-name.vercel.app
```

## 🚀 Deployment Steps

### 1. **Deploy Backend First**
```bash
cd backend
vercel deploy --prod
```
This will give you a URL like: `https://feesportal-api-xyz123.vercel.app`

### 2. **Update Backend Environment Variables on Vercel**
Go to Vercel Dashboard → Your Backend Project → Settings → Environment Variables
- Add `FRONTEND_URL=https://feesportal.vercel.app`
- Update `MONGO_URI` with your MongoDB connection string
- Update `JWT_SECRET` with a secure random string

### 3. **Update Frontend `.env`**
Replace `your-backend-name.vercel.app` with your actual backend URL:
```
VITE_API_URL=https://feesportal-api-xyz123.vercel.app
```

### 4. **Deploy Frontend**
```bash
cd frontend
vercel deploy --prod
```

## 🔍 Finding Your Backend URL

After deploying backend to Vercel, your URL will be shown in the terminal output:
```
✓ Production: https://feesportal-api-abc123.vercel.app
```

## ✅ Testing the Connection

### Local Testing
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```
Visit `http://localhost:5173` → Login → Should work ✓

### Production Testing
1. Go to `https://feesportal.vercel.app`
2. Open DevTools → Network tab
3. Click Login
4. Check the request to `/api/auth/login`
5. Should see `200 OK` with response (not CORS error)

## 🆘 If You Still Get CORS Errors

1. Check that backend URL in `frontend/.env` is correct (no `/api` at end)
2. Verify `FRONTEND_URL` is set in backend environment variables
3. Make sure frontend domain matches exactly in backend CORS whitelist
4. Clear browser cache and restart dev server

## 📝 How CORS Works in This App

**Frontend** → Makes request to backend
```
https://feesportal.vercel.app/api/auth/login
     ↓ (with CORS preflight)
https://your-backend.vercel.app/api/auth/login
```

**Backend** checks if frontend origin is allowed, then responds with:
```
Access-Control-Allow-Origin: https://feesportal.vercel.app
```

This header tells the browser "yes, this origin is allowed to access this resource"

## 🎯 Common Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| CORS error at login | Backend doesn't recognize frontend origin | Update FRONTEND_URL env var on Vercel |
| Double /api in URL | VITE_API_URL ends with /api | Remove /api from VITE_API_URL |
| 401 Unauthorized | JWT token not sent | Check Authorization header in axios |
| Connection refused | Backend URL is wrong | Verify backend URL in frontend/.env |

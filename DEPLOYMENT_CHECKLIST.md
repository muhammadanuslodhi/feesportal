# ✅ Production Deployment Checklist

## **Phase 1: Local Verification (Before Pushing to Git)**

### Backend Configuration
- [ ] `backend/server.js` exists with proper imports
- [ ] `backend/api/index.js` has:
  - [ ] `app.set('trust proxy', 1)` at the top
  - [ ] `app.use(cors(corsOptions))` setup
  - [ ] `app.options('*', cors(corsOptions))` for preflight
  - [ ] `allowedOrigins` includes `'https://feesportal.vercel.app'`
  - [ ] `optionsSuccessStatus: 200` in corsOptions
- [ ] `backend/vercel.json` has:
  - [ ] `"src": "server.js"` (not api/index.js)
  - [ ] Routes point to `server.js`
  - [ ] Environment variables section with all 5 variables

### Backend Environment Variables
- [ ] `backend/.env` exists with:
  - [ ] `MONGO_URI=mongodb+srv://...`
  - [ ] `JWT_SECRET=your_secret_key`
  - [ ] `FRONTEND_URL=https://feesportal.vercel.app`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`

### Frontend Configuration
- [ ] `frontend/.env` has:
  - [ ] `VITE_API_URL=https://feesportal-backend.vercel.app`
- [ ] `frontend/src/api/axios.js` has:
  - [ ] `withCredentials: true`
  - [ ] Console logging for requests/responses
  - [ ] Error handling for CORS

### Git Repository
- [ ] All changes committed:
  ```bash
  git status  # Should show "nothing to commit"
  ```

---

## **Phase 2: Vercel Backend Setup**

### Project Creation
- [ ] Vercel account created at https://vercel.com
- [ ] GitHub connected to Vercel
- [ ] New project created from feesportal repository
- [ ] **Root Directory set to:** `backend`

### Environment Variables (CRITICAL!)
Go to **Settings** → **Environment Variables** and add each:

- [ ] **MONGO_URI**
  - Value: `mongodb+srv://Vercel-Admin-feesportaldb:56Rsw33mBjnFli6z@feesportaldb.lejqj4s.mongodb.net/test?retryWrites=true&w=majority`
  - Scope: **Production**

- [ ] **MONGODB_URI**
  - Value: *(same as MONGO_URI)*
  - Scope: **Production**

- [ ] **JWT_SECRET**
  - Value: *your strong random secret (32+ chars)*
  - Scope: **Production**
  - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

- [ ] **FRONTEND_URL**
  - Value: `https://feesportal.vercel.app`
  - Scope: **Production**

- [ ] **NODE_ENV**
  - Value: `production`
  - Scope: **Production**

### Deployment
- [ ] Deploy backend project
- [ ] Deployment successful (check status)
- [ ] Copy backend URL: `https://feesportal-backend-xxxxx.vercel.app`
- [ ] Test backend health:
  ```bash
  curl https://feesportal-backend-xxxxx.vercel.app/
  # Should return: {"ok":true,"name":"Fees Portal API"}
  ```

### Logs Verification
- [ ] Go to **Deployments** → latest deployment → **Logs**
- [ ] Look for: `✅ CORS Allowed Origins: [...]`
- [ ] No errors in startup logs

---

## **Phase 3: Vercel Frontend Setup**

### Project Creation
- [ ] New frontend project created from feesportal repository
- [ ] **Root Directory set to:** `frontend`

### Configuration
- [ ] **Build Command:** `npm run build`
- [ ] **Output Directory:** `dist`
- [ ] **Install Command:** `npm ci`

### Update Environment
- [ ] `frontend/.env` updated with actual backend URL:
  ```
  VITE_API_URL=https://feesportal-backend-xxxxx.vercel.app
  ```
- [ ] Changes committed and pushed:
  ```bash
  git add frontend/.env
  git commit -m "Config: Update backend API URL"
  git push origin main
  ```

### Deployment
- [ ] Deploy frontend project
- [ ] Deployment successful
- [ ] Copy frontend URL: `https://feesportal.vercel.app` (or custom domain)

---

## **Phase 4: Post-Deployment Verification**

### Backend Health Check
```bash
# Test 1: Basic health
curl https://feesportal-backend-xxxxx.vercel.app/
# Expected: {"ok":true,"name":"Fees Portal API"}

# Test 2: CORS Preflight
curl -i -X OPTIONS \
  https://feesportal-backend-xxxxx.vercel.app/api/auth/login \
  -H "Origin: https://feesportal.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
# Expected: 200 OK with CORS headers
```

### Frontend Loading
- [ ] Open `https://feesportal.vercel.app` in browser
- [ ] Page loads without 404 errors
- [ ] Inspect DevTools:
  - [ ] **Console tab:** No CORS errors
  - [ ] **Console tab:** See API configuration logs
  - [ ] **Network tab:** Requests to `feesportal-backend-xxxxx.vercel.app` visible

### Login Testing
- [ ] Click "Sign In" button
- [ ] Open DevTools → **Network** tab
- [ ] Enter credentials: `admin` / `admin123`
- [ ] Click "Sign In"
- [ ] Verify Network tab:
  - [ ] See `auth/login` POST request
  - [ ] Status is `200 OK` (not CORS error)
  - [ ] Response contains `token` and `username`
- [ ] Verify Console tab:
  - [ ] See `📤 POST /auth/login`
  - [ ] See `✅ Response received: 200`
  - [ ] No red error messages

### Dashboard Access
- [ ] After successful login, redirected to dashboard
- [ ] Dashboard loads without errors
- [ ] API calls succeed (Network tab shows successful requests)

---

## **Phase 5: Troubleshooting Matrix**

### If Backend Health Check Fails

```bash
# Check 1: Backend URL is accessible
ping feesportal-backend-xxxxx.vercel.app

# Check 2: View Vercel logs
# In Vercel Dashboard:
# Deployments → Latest → Logs
# Look for error messages

# Check 3: Verify environment variables
# In Vercel Dashboard:
# Settings → Environment Variables
# Confirm all 5 variables are set to "Production" scope
```

**Solution:** Redeploy backend with environment variables

### If Frontend Shows CORS Error

```
Error: "No 'Access-Control-Allow-Origin' header is present"
```

**Checklist:**
- [ ] `FRONTEND_URL=https://feesportal.vercel.app` set in backend Vercel
- [ ] Backend redeployed AFTER setting FRONTEND_URL
- [ ] Frontend .env has correct backend URL
- [ ] Frontend redeployed after updating .env
- [ ] Browser cache cleared (Ctrl+Shift+R)

**Solution:** 
1. Check Vercel environment variables
2. Redeploy both backend and frontend
3. Hard refresh browser

### If Login Returns 401

```
Error: "401 Unauthorized"
```

**Checklist:**
- [ ] `JWT_SECRET` matches on frontend and backend
- [ ] MongoDB connection working (check backend logs)
- [ ] User exists in database with correct credentials

**Solution:**
1. Check backend logs for MongoDB errors
2. Verify JWT_SECRET matches
3. Test login credentials

### If Frontend Shows 404

```
Error: "Cannot GET /"
```

**Checklist:**
- [ ] Frontend root directory set to `frontend` (not `/`)
- [ ] Build command is `npm run build`
- [ ] Output directory is `dist`
- [ ] Vercel rewrites configured for SPA

**Solution:**
1. Check Vercel project settings
2. Redeploy frontend
3. Clear browser cache

---

## **Phase 6: Security Verification**

- [ ] JWT_SECRET is strong (32+ characters, random)
- [ ] `.env` files are in `.gitignore` (not committed)
- [ ] MongoDB credentials use restricted user (not admin)
- [ ] Frontend URL is your actual domain (not localhost)
- [ ] No sensitive data in frontend code or logs

---

## **Final Sign-Off**

When all items are checked:

✅ **Backend is deployed and working**
✅ **Frontend is deployed and working**
✅ **CORS is properly configured**
✅ **Login works end-to-end**
✅ **Database connection is working**
✅ **No errors in console or network tab**

**🎉 Your production deployment is complete and working!**

---

## **Commands for Quick Reference**

```bash
# Generate secure JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test backend
curl https://feesportal-backend-xxxxx.vercel.app/

# Test CORS
curl -i -X OPTIONS https://feesportal-backend-xxxxx.vercel.app/api/auth/login \
  -H "Origin: https://feesportal.vercel.app" \
  -H "Access-Control-Request-Method: POST"

# View Vercel logs
vercel logs

# Redeploy specific project
vercel deploy --prod
```

---

**See [PRODUCTION_CORS_FIX.md](PRODUCTION_CORS_FIX.md) for detailed step-by-step instructions.**


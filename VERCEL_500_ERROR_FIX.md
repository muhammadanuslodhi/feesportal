# 🔧 Vercel 500 Error Fix - Complete Guide

## **Problem: FUNCTION_INVOCATION_FAILED**

Backend is returning:
```
500: INTERNAL_SERVER_ERROR
Code: FUNCTION_INVOCATION_FAILED
Message: "Serverless Function has crashed"
```

---

## **Root Cause Analysis**

### The Issue
The backend was calling `connectDB()` **synchronously on startup** without awaiting it. This causes:

1. **Function starts up**
2. **`connectDB()` is called** (async, but not awaited)
3. **Vercel serverless function freezes** waiting for something
4. **MongoDB connection attempt times out** (due to firewall or credentials)
5. **Function crashes with 500 error**
6. **Request never completes**

### Why It Fails
- Vercel serverless has a **30-second timeout**
- MongoDB connection attempt might hang waiting for DNS/network
- Function dies before it can even start accepting requests
- All endpoints return 500

---

## **Solution Implemented**

### ✅ **Change 1: Lazy Database Connection**

**OLD (Wrong):**
```javascript
const connectDB = require('../config/db');
// ... 
connectDB();  // ❌ Blocks startup, times out, crashes
```

**NEW (Correct):**
```javascript
// Lazy connection - connect on first request
const ensureDbConnection = async () => {
  if (dbConnected) return true;
  // ... try to connect
};

// Middleware attempts connection on API requests (not on startup)
app.use(async (req, res, next) => {
  if (!dbConnected && !dbConnecting) {
    await ensureDbConnection().catch(err => {
      console.warn('Database connection failed');
    });
  }
  next();
});
```

**Why:**
- ✅ Function starts immediately (doesn't wait for DB)
- ✅ Returns health check endpoint instantly
- ✅ Attempts DB connection on first API request (not blocking)
- ✅ Gracefully handles DB connection failures
- ✅ Allows function to respond to users even if DB is down

### ✅ **Change 2: Health Check Endpoint**

**Added:**
```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: dbConnected ? 'connected' : 'connecting',
    timestamp: new Date().toISOString()
  });
});
```

**Purpose:**
- ✅ Verifies function is responding
- ✅ Doesn't require database connection
- ✅ Used for Vercel health checks
- ✅ Shows database connection status

### ✅ **Change 3: Better Vercel Configuration**

**Updated `vercel.json`:**
```json
{
  "functions": {
    "server.js": {
      "memory": 1024,
      "maxDuration": 30,
      "timeout": 10
    }
  }
}
```

**What this does:**
- Sets memory allocation (1GB for Node.js)
- Sets max execution time (30 seconds)
- Sets request timeout (10 seconds)

---

## **Testing Steps**

### **Step 1: Test Locally First**

```bash
# Terminal 1 - Backend with mock DB
cd backend
npm run dev:mock

# Should see:
# ✅ Using mock in-memory database
# 🚀 Fees Portal API running on http://localhost:5000
```

**Test endpoints:**
```bash
# Test health
curl http://localhost:5000/health
# Expected: {"status":"ok","database":"..."}

# Test root
curl http://localhost:5000/
# Expected: {"ok":true,"name":"Fees Portal API"}

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Expected: {"token":"...","username":"admin"}
```

If all work locally, proceed to deployment.

### **Step 2: Verify Code Changes**

```bash
# Check that api/index.js has lazy connection
grep -n "ensureDbConnection" backend/api/index.js

# Check that health endpoint exists
grep -n "app.get('/health'" backend/api/index.js

# Check vercel.json has proper config
cat backend/vercel.json | grep -A5 "functions"
```

### **Step 3: Deploy to Vercel**

```bash
# From backend folder
cd backend

# Deploy with production environment
vercel --prod

# This will:
# 1. Deploy code
# 2. Use environment variables from Vercel
# 3. Start serverless function
```

### **Step 4: Test Production**

**Test the health endpoint:**
```bash
curl https://feesportal-backend-xxxxx.vercel.app/health

# Should return immediately (even if DB not connected):
# {"status":"ok","database":"connecting...","timestamp":"..."}
```

**If health check fails:**
- ❌ Function still not starting
- ❌ Check Vercel logs: `Deployments → Latest → Logs`
- ❌ Look for errors in startup

**If health check works:**
- ✅ Function is responding
- ✅ DB will connect on first API request
- ✅ Ready for testing

**Test the root endpoint:**
```bash
curl https://feesportal-backend-xxxxx.vercel.app/

# Should return:
# {"ok":true,"name":"Fees Portal API","database":"..."}
```

**Test login (with CORS):**
```bash
# From frontend (or via curl with origin header)
curl -X POST https://feesportal-backend-xxxxx.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://feesportal.vercel.app" \
  -d '{"username":"admin","password":"admin123"}'

# Expected: 200 OK with token
# Or: 401 if DB not connected (still better than 500 error)
```

---

## **Troubleshooting**

### **Still Getting 500 Error?**

**Check 1: Is the code deployed?**
```bash
# Check Vercel logs
https://vercel.com/dashboard → your-backend-project → Deployments → Latest → Logs

# Look for:
# ✅ "CORS Allowed Origins: [...]"
# ✅ "API running" message

# If not there, code didn't deploy
# → Redeploy manually
```

**Check 2: Environment variables set?**
```bash
# In Vercel Dashboard:
# Settings → Environment Variables

# Verify present:
# - MONGO_URI ✓
# - JWT_SECRET ✓
# - FRONTEND_URL ✓
# - NODE_ENV ✓

# If any missing:
# → Add them
# → Redeploy
```

**Check 3: Build succeeded?**
```bash
# In Vercel Dashboard:
# Deployments → Latest → Click deployment

# Check build logs:
# - Should see "npm install"
# - Should see "Build successful"
# - Should NOT see red errors

# If build failed:
# → Check error message
# → Fix locally
# → Redeploy
```

**Check 4: Test health endpoint first**
```bash
# Test just the health check
curl https://your-backend.vercel.app/health

# If this fails:
# → Function isn't responding at all
# → Check Vercel logs for startup errors

# If this works:
# → Function is responding
# → DB connection might be failing (not a 500 error)
```

### **Getting CORS Error Instead of 500?**

✅ **Good news!** This means the function is working!

The CORS error is a different issue:
1. Backend is responding
2. Frontend request is being processed
3. CORS validation is happening
4. Something is being rejected

See [PRODUCTION_CORS_FIX.md](PRODUCTION_CORS_FIX.md) for CORS troubleshooting.

### **Getting 401 Unauthorized Instead of 500?**

✅ **Excellent!** This means:
1. ✅ Function is working
2. ✅ DB connection initiated
3. ✅ API is processing request
4. ❌ Just authentication failed (expected if wrong credentials or DB not ready)

This is **normal and correct behavior** - not a server error!

---

## **Deployment Checklist**

### Before Deploying
- [ ] `api/index.js` has lazy connection
- [ ] Health endpoint added
- [ ] `vercel.json` has functions config
- [ ] All environment variables verified locally
- [ ] Code tested locally with `npm run dev:mock`
- [ ] No syntax errors

### During Deployment
- [ ] Commit changes: `git add . && git commit -m "Fix: Lazy DB connection for Vercel"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Deploy backend: `vercel --prod`
- [ ] Wait for deployment to complete
- [ ] Check build logs for errors

### After Deployment
- [ ] Test health endpoint: `curl https://your-backend.vercel.app/health`
- [ ] Test root endpoint: `curl https://your-backend.vercel.app/`
- [ ] Test login: attempt login from frontend
- [ ] Check Vercel logs for any warnings
- [ ] Monitor for next 5 minutes

---

## **Performance Impact**

### What Changes
| Aspect | Before | After |
|--------|--------|-------|
| Function startup | Waits for DB | Instant ✅ |
| Response time | Slow (or 500) | Fast ✅ |
| DB connection | Blocking | Non-blocking ✅ |
| Health checks | Fail if DB down | Always work ✅ |

### No Negative Impact
- ✅ Latency might be **slightly lower**
- ✅ More reliable (handles DB failures gracefully)
- ✅ Better for monitoring
- ✅ Better user experience

---

## **Monitoring & Alerts**

### Set Up in Vercel
1. Go to your backend project
2. Click **Settings** → **Monitoring**
3. Enable:
   - [ ] Function invocations
   - [ ] Function duration
   - [ ] Error rate
4. Set alerts for:
   - [ ] Error rate > 5%
   - [ ] P99 latency > 3000ms

### Check Logs Regularly
```bash
# View latest logs
vercel logs --lines 50

# Filter for errors
vercel logs | grep -i error

# Filter for auth/login
vercel logs | grep auth/login
```

---

## **Quick Commands**

```bash
# Test locally
npm run dev:mock

# Deploy
vercel --prod

# View logs
vercel logs

# Check health
curl https://your-backend.vercel.app/health

# View project info
vercel projects info

# Redeploy if needed
vercel deploy --prod
```

---

## **Files Modified**

1. ✅ `backend/api/index.js` - Added lazy connection, health endpoint
2. ✅ `backend/vercel.json` - Added functions config, explicit routes
3. ✅ No other changes needed

---

## **Expected Results**

### Before Fix
```
GET https://feesportal-backend.vercel.app/api/auth/login
→ 500 INTERNAL_SERVER_ERROR
→ "Serverless Function has crashed"
→ Function unavailable for 30 seconds
```

### After Fix
```
GET https://feesportal-backend.vercel.app/health
→ 200 OK
→ {"status":"ok",...}

POST https://feesportal-backend.vercel.app/api/auth/login
→ 200 OK or 401 (not 500!)
→ Function responds correctly
```

---

## **Success Criteria**

✅ Health endpoint responds immediately
✅ Root endpoint responds with API info
✅ Login endpoint processes requests (200 or 401, not 500)
✅ No "Serverless Function crashed" errors
✅ Vercel logs show normal operation
✅ Frontend can make API calls

---

**When all tests pass, you're done! 🎉**

The backend is now production-ready and will handle database connection issues gracefully without crashing.


# Zero-Cost Deployment (Auto-Update on Git Push)# Zero-Cost Deployment (Auto-Update on Git Push)



Deploy the Hospital Management System for free with automatic redeploys on every GitHub push.This guide shows how to deploy the app for free and automatically redeploy whenever you push to GitHub.



## StackWhat you’ll set up:

- **Frontend (React)** → Netlify (free, auto-deploy)- Frontend (React) on Netlify — free, auto-deploys from GitHub

- **Backend (Node/Express + WebSockets)** → Koyeb (free, auto-deploy)- Backend (Node/Express + WebSockets) on Koyeb — free, auto-deploys from GitHub

- **Database** → MongoDB Atlas M0 (free)- Database on MongoDB Atlas (M0 free cluster)



**Note:** Authentication has been removed. All endpoints are publicly accessible.Notes:

- Both Netlify and Koyeb redeploy on every push to their connected GitHub branches.

---- Koyeb supports WebSockets and long-lived connections used by Socket.IO.

- If you prefer Vercel for the frontend, a ready `vercel.json` is present. Steps are analogous to Netlify.

## 1) Environment Variables

## 1) Prepare environment variables

### Backend (`backend/.env`)

```envBackend required env (see `backend/.env.example` and `backend/src/config/env.js`):

PORT=8080- `PORT` = 8080 (or leave empty; platform injects `PORT`)

CLIENT_ORIGIN=https://your-site.netlify.app- `CLIENT_ORIGIN` = your Netlify site URL (e.g., `https://your-site.netlify.app`)

# Or for multiple origins (dev):- `MONGODB_URI` = your Atlas connection string

CLIENT_ORIGINS=http://localhost:3000,http://localhost:3001- `JWT_SECRET` = a strong random string

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hospital?retryWrites=true&w=majority- `JWT_REFRESH_SECRET` = another strong string

# Optional integrations- Optional: Cloudinary, Stripe, Razorpay, SMTP, Twilio as needed

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=Frontend required env (see `frontend/src/services/api.js`):

CLOUDINARY_API_SECRET=- `REACT_APP_API_URL` = your backend base URL (e.g., `https://your-api.koyeb.app/api`)

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=## 2) Database: MongoDB Atlas (Free)

STRIPE_SECRET_KEY=1. Create an M0 free cluster on https://www.mongodb.com/atlas/database

STRIPE_WEBHOOK_SECRET=2. Create a DB user and network access (allow from 0.0.0.0/0 or Koyeb IPs)

SMTP_HOST=3. Copy connection string and set `MONGODB_URI` in Koyeb (Backend service) env vars.

SMTP_PORT=

SMTP_USER=## 3) Backend on Koyeb (Free, auto-deploy)

SMTP_PASS=Koyeb can build Docker images straight from your repo. A `backend/Dockerfile` is included.

TWILIO_ACCOUNT_SID=

TWILIO_AUTH_TOKEN=Steps:

```1. Sign in to https://www.koyeb.com/ and “Create Service”.

2. Source = GitHub repo; select your repository and branch.

### Frontend (`frontend/.env`)3. Root directory = `backend` (important for monorepo).

```env4. Deployment method = Docker.

REACT_APP_API_URL=https://your-api.koyeb.app/api5. Exposed port = 8080 (the app uses `PORT` env; defaults to 8080).

REACT_APP_SOCKET_URL=https://your-api.koyeb.app6. Set environment variables:

```   - `CLIENT_ORIGIN` (Netlify URL)

   - `MONGODB_URI`

---   - `JWT_SECRET`, `JWT_REFRESH_SECRET`

   - Any other integrations you use (Cloudinary, Stripe, etc.)

## 2) MongoDB Atlas (Free)7. Create the service. The public URL will be something like `https://<app>.koyeb.app`.

8. Verify health: open `https://<app>.koyeb.app/health` (should return status: ok).

1. Create an **M0 free cluster** at https://www.mongodb.com/atlas/database

2. Add a database user (username + password)Auto updates: Koyeb will automatically redeploy on every push to the connected branch.

3. Network Access: Allow `0.0.0.0/0` (or specific Koyeb IPs)

4. Copy the connection string → use as `MONGODB_URI` on Koyeb## 4) Frontend on Netlify (Free, auto-deploy)

Netlify is already configured as a SPA via `frontend/netlify.toml`.

---

Steps:

## 3) Backend on Koyeb (Free)1. Sign in to https://app.netlify.com/ and “Add new site” → “Import an existing project”.

2. Pick GitHub repo; set Base directory = `frontend`.

Koyeb builds from the included `backend/Dockerfile`.3. Build command = `npm run build`

4. Publish directory = `build`

### Steps:5. Env variables:

1. Sign in to https://www.koyeb.com/ → **Create Service**   - `REACT_APP_API_URL` = `https://<app>.koyeb.app/api`

2. **Source:** GitHub repo `2303A51618/Hosptital-Management-System`, branch `main`6. Deploy. Netlify will assign a URL like `https://your-site.netlify.app`.

3. **Root directory:** `backend`

4. **Deployment method:** DockerAuto updates: Netlify rebuilds and redeploys on every push to the connected branch.

5. **Exposed port:** 8080

6. **Environment variables:**## 5) Configure CORS and cookies

   - `CLIENT_ORIGIN` = your Netlify URL (e.g., `https://your-site.netlify.app`)In the backend, CORS uses `CLIENT_ORIGIN`. Ensure it matches your Netlify URL exactly.

   - `MONGODB_URI` = your Atlas connection string

   - Any optional integrations (Cloudinary, Stripe, etc.)If you use secure cookies, confirm these match your domain scheme:

7. **Deploy** → Koyeb will assign a URL like `https://your-app.koyeb.app`- `COOKIE_SECURE=true` (HTTPS only)

8. **Verify:** Visit `https://your-app.koyeb.app/health` (should return `{"status":"ok",...}`)- `COOKIE_SAMESITE=None`



**Auto-updates:** Every push to `main` triggers a rebuild and redeploy.## 6) Point frontend to backend

Set `REACT_APP_API_URL` on Netlify to the Koyeb API base, including `/api` path.

---

Example: `https://your-api.koyeb.app/api`

## 4) Frontend on Netlify (Free)

## 7) Optional: Custom domains and HTTPS

Netlify is configured via `frontend/netlify.toml`.- Add a custom domain in Netlify (frontend) and Koyeb (backend); both provide free certificates via Let’s Encrypt.



### Steps:## 8) Optional: Vercel for the frontend

1. Sign in to https://app.netlify.com/ → **Add new site** → **Import from Git**If you prefer Vercel instead of Netlify, use the included `frontend/vercel.json`:

2. Pick GitHub repo `2303A51618/Hosptital-Management-System`, branch `main`1. Create a new Vercel project from GitHub, root = `frontend`

3. **Base directory:** `frontend`2. Build command = `npm run build`, Output = `build`

4. **Build command:** `npm run build`3. Set `REACT_APP_API_URL`

5. **Publish directory:** `build`4. Every push auto-deploys

6. **Environment variables:**

   - `REACT_APP_API_URL` = `https://your-app.koyeb.app/api`## 9) Troubleshooting

   - `REACT_APP_SOCKET_URL` = `https://your-app.koyeb.app`- 401 on login → Check cookies/CORS: `CLIENT_ORIGIN`, `COOKIE_SECURE`, and Netlify site URL.

7. **Deploy** → Netlify assigns a URL like `https://your-site.netlify.app`- CORS blocked → Ensure `CLIENT_ORIGIN` matches the exact frontend URL and protocol.

- Socket.IO not connecting → Confirm Koyeb URL and that the frontend connects to the same base domain (or explicitly to the Koyeb URL) when initializing sockets.

**Auto-updates:** Every push to `main` triggers a rebuild and redeploy.

## Quick checklist

---- [ ] Backend builds on Koyeb with Dockerfile

- [ ] Env vars set on Koyeb (MongoDB, JWT, CLIENT_ORIGIN, etc.)

## 5) Configure CORS- [ ] Frontend builds on Netlify

- [ ] `REACT_APP_API_URL` points to `https://<app>.koyeb.app/api`

Update `CLIENT_ORIGIN` on Koyeb to match your exact Netlify URL:- [ ] CORS working end-to-end, login success

```
CLIENT_ORIGIN=https://your-site.netlify.app
```

For local dev on multiple ports, use:
```
CLIENT_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## 6) Optional: Custom Domains

Both Netlify and Koyeb support custom domains with free SSL (Let's Encrypt).

- **Netlify:** Site settings → Domain management → Add custom domain
- **Koyeb:** Service settings → Domains → Add custom domain

---

## 7) Optional: Vercel for Frontend

If you prefer Vercel, use the included `frontend/vercel.json`:
1. Create new project on https://vercel.com/ from GitHub
2. Root: `frontend`
3. Build command: `npm run build`, Output: `build`
4. Add env vars: `REACT_APP_API_URL`, `REACT_APP_SOCKET_URL`
5. Deploy (auto-redeploys on push)

---

## 8) Troubleshooting

| Issue | Fix |
|-------|-----|
| **CORS blocked** | Ensure `CLIENT_ORIGIN` exactly matches frontend URL (no trailing slash) |
| **Socket.IO not connecting** | Verify `REACT_APP_SOCKET_URL` points to Koyeb base URL |
| **Backend 404 on "/"** | Expected; API has no root route. Use `/health` or frontend URL |
| **Build fails on Koyeb** | Check logs; ensure `MONGODB_URI` is set and valid |
| **Frontend build fails** | Verify `REACT_APP_API_URL` is set on Netlify |

---

## Quick Deployment Checklist

- [ ] MongoDB Atlas M0 cluster created and accessible
- [ ] Koyeb service running with Dockerfile
- [ ] Koyeb env vars set: `CLIENT_ORIGIN`, `MONGODB_URI`
- [ ] Netlify site deployed from `frontend/`
- [ ] Netlify env vars set: `REACT_APP_API_URL`, `REACT_APP_SOCKET_URL`
- [ ] CORS working (no errors in browser console)
- [ ] Health endpoint returns ok: `https://<app>.koyeb.app/health`
- [ ] Frontend loads and connects to backend API

---

**That's it!** Every push to GitHub will auto-deploy both frontend and backend. No costs, no credit card required.

# Zero-Cost Deployment (Auto-Update on Git Push)

This guide shows how to deploy the app for free and automatically redeploy whenever you push to GitHub.

What you’ll set up:
- Frontend (React) on Netlify — free, auto-deploys from GitHub
- Backend (Node/Express + WebSockets) on Koyeb — free, auto-deploys from GitHub
- Database on MongoDB Atlas (M0 free cluster)

Notes:
- Both Netlify and Koyeb redeploy on every push to their connected GitHub branches.
- Koyeb supports WebSockets and long-lived connections used by Socket.IO.
- If you prefer Vercel for the frontend, a ready `vercel.json` is present. Steps are analogous to Netlify.

## 1) Prepare environment variables

Backend required env (see `backend/.env.example` and `backend/src/config/env.js`):
- `PORT` = 8080 (or leave empty; platform injects `PORT`)
- `CLIENT_ORIGIN` = your Netlify site URL (e.g., `https://your-site.netlify.app`)
- `MONGODB_URI` = your Atlas connection string
- `JWT_SECRET` = a strong random string
- `JWT_REFRESH_SECRET` = another strong string
- Optional: Cloudinary, Stripe, Razorpay, SMTP, Twilio as needed

Frontend required env (see `frontend/src/services/api.js`):
- `REACT_APP_API_URL` = your backend base URL (e.g., `https://your-api.koyeb.app/api`)

## 2) Database: MongoDB Atlas (Free)
1. Create an M0 free cluster on https://www.mongodb.com/atlas/database
2. Create a DB user and network access (allow from 0.0.0.0/0 or Koyeb IPs)
3. Copy connection string and set `MONGODB_URI` in Koyeb (Backend service) env vars.

## 3) Backend on Koyeb (Free, auto-deploy)
Koyeb can build Docker images straight from your repo. A `backend/Dockerfile` is included.

Steps:
1. Sign in to https://www.koyeb.com/ and “Create Service”.
2. Source = GitHub repo; select your repository and branch.
3. Root directory = `backend` (important for monorepo).
4. Deployment method = Docker.
5. Exposed port = 8080 (the app uses `PORT` env; defaults to 8080).
6. Set environment variables:
   - `CLIENT_ORIGIN` (Netlify URL)
   - `MONGODB_URI`
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`
   - Any other integrations you use (Cloudinary, Stripe, etc.)
7. Create the service. The public URL will be something like `https://<app>.koyeb.app`.
8. Verify health: open `https://<app>.koyeb.app/health` (should return status: ok).

Auto updates: Koyeb will automatically redeploy on every push to the connected branch.

## 4) Frontend on Netlify (Free, auto-deploy)
Netlify is already configured as a SPA via `frontend/netlify.toml`.

Steps:
1. Sign in to https://app.netlify.com/ and “Add new site” → “Import an existing project”.
2. Pick GitHub repo; set Base directory = `frontend`.
3. Build command = `npm run build`
4. Publish directory = `build`
5. Env variables:
   - `REACT_APP_API_URL` = `https://<app>.koyeb.app/api`
6. Deploy. Netlify will assign a URL like `https://your-site.netlify.app`.

Auto updates: Netlify rebuilds and redeploys on every push to the connected branch.

## 5) Configure CORS and cookies
In the backend, CORS uses `CLIENT_ORIGIN`. Ensure it matches your Netlify URL exactly.

If you use secure cookies, confirm these match your domain scheme:
- `COOKIE_SECURE=true` (HTTPS only)
- `COOKIE_SAMESITE=None`

## 6) Point frontend to backend
Set `REACT_APP_API_URL` on Netlify to the Koyeb API base, including `/api` path.

Example: `https://your-api.koyeb.app/api`

## 7) Optional: Custom domains and HTTPS
- Add a custom domain in Netlify (frontend) and Koyeb (backend); both provide free certificates via Let’s Encrypt.

## 8) Optional: Vercel for the frontend
If you prefer Vercel instead of Netlify, use the included `frontend/vercel.json`:
1. Create a new Vercel project from GitHub, root = `frontend`
2. Build command = `npm run build`, Output = `build`
3. Set `REACT_APP_API_URL`
4. Every push auto-deploys

## 9) Troubleshooting
- 401 on login → Check cookies/CORS: `CLIENT_ORIGIN`, `COOKIE_SECURE`, and Netlify site URL.
- CORS blocked → Ensure `CLIENT_ORIGIN` matches the exact frontend URL and protocol.
- Socket.IO not connecting → Confirm Koyeb URL and that the frontend connects to the same base domain (or explicitly to the Koyeb URL) when initializing sockets.

## Quick checklist
- [ ] Backend builds on Koyeb with Dockerfile
- [ ] Env vars set on Koyeb (MongoDB, JWT, CLIENT_ORIGIN, etc.)
- [ ] Frontend builds on Netlify
- [ ] `REACT_APP_API_URL` points to `https://<app>.koyeb.app/api`
- [ ] CORS working end-to-end, login success

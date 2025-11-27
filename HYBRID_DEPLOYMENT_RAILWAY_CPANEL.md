# Hybrid Deployment: Backend on Railway, Frontend on cPanel

This guide explains how to deploy:
- **Backend (Node + whatsapp-web.js)** on **Railway** (supports Puppeteer/Chromium).
- **Frontend (React build)** on your existing **cPanel** hosting.

---

## Part A – Backend on Railway

### 1. Prepare Repository
1. Ensure the latest code is pushed to GitHub/GitLab (Railway pulls from git).
2. `backend/src/server.js` already supports:
   - Environment-based CORS via `ALLOWED_ORIGINS`.
   - No dependency on frontend build.

### 2. Create Railway Service
1. Go to [Railway.app](https://railway.app) → New Project → Deploy from GitHub.
2. Select this repository and branch.
3. After import, open the service:
   - **Root Directory**: `backend` (Settings → Service Settings → Root Directory).
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Set **Environment Variables** (Settings → Variables):
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS=https://yourfrontenddomain.com`
   - `WHATSAPP_SESSION_PATH=./.wwebjs_auth`
   - (optional) `MESSAGES_PER_MINUTE_MAX=40`
   - `PORT` is provided by Railway automatically.

### 3. Persistent Session (Recommended)
1. Add a **Persistent Volume** (Service → Settings → Persistent Storage).
2. Mount path: `/app/.wwebjs_auth`
3. Update env: `WHATSAPP_SESSION_PATH=/app/.wwebjs_auth`

### 4. Deploy & Test
1. Trigger a deploy (Railway builds automatically on push).
2. Check Logs → ensure Puppeteer launches.
3. Copy the public backend URL (e.g., `https://bwea-backend.up.railway.app`).
4. Test endpoints:
   - `GET /api/session/status`
   - Ensure QR code is generated.

---

## Part B – Frontend on cPanel

Use the existing cPanel steps in `CPANEL_DEPLOYMENT.md` (frontend-only):

1. Build locally: `cd frontend && npm install && npm run build`.
2. Upload `frontend/dist` contents into your cPanel `public_html` (or subdomain directory).
3. Ensure `index.html`, `assets/` etc. exist on the server.
4. Optional: configure `.htaccess` for SPA routing (see cPanel guide).

---

## Part C – Wire Them Together

1. In cPanel, create/modify `frontend/.env.production` (or set via build command):
   - `VITE_API_URL=https://your-railway-backend-url`
2. Rebuild frontend with this env:
   ```bash
   cd frontend
   VITE_API_URL=https://your-railway-backend-url npm run build
   ```
3. Upload new `dist` bundle to cPanel.
4. Update backend `ALLOWED_ORIGINS` env to the final frontend URL:
   - e.g., `https://whatsapp.yourdomain.com`

---

## Verification Checklist

- [ ] Railway service running, logs show “Backend listening…”.
- [ ] `GET https://<railway>/api/session/status` returns `{ ready:false }`.
- [ ] Frontend hosted on cPanel loads successfully over HTTPS.
- [ ] Frontend `.env`/build points to Railway API.
- [ ] WhatsApp QR appears on frontend.
- [ ] Sending test message succeeds.
- [ ] Progress + report endpoints reachable from frontend.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS error from frontend | Ensure `ALLOWED_ORIGINS` on Railway matches frontend domain (including protocol). |
| QR not showing | Check Railway logs for puppeteer errors; ensure service plan has enough RAM (Starter plan recommended). |
| Session lost after redeploy | Mount persistent volume & set `WHATSAPP_SESSION_PATH`. |
| Frontend still calling localhost | Rebuild frontend with `VITE_API_URL` pointing to Railway URL. |
| HTTPS mixed content | Ensure cPanel site uses HTTPS and backend URL is also HTTPS (Railway provides). |

---

## Optional Enhancements

- **Custom Domain for Backend**: In Railway → Settings → Domains → add custom domain, then update `VITE_API_URL` & `ALLOWED_ORIGINS`.
- **Monitoring**: Use Railway metrics/log drains or a third-party monitoring tool.

---

By splitting the deployment this way, you leverage Railway’s support for headless Chromium while keeping your frontend on your existing cPanel hosting. Update both sides whenever URLs or env variables change.


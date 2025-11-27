# Deploying to Render.com

Render provides managed Node.js hosting that supports Puppeteer/Chromium, making it a good alternative to cPanel for this project.

## 1. Prerequisites

- GitHub, GitLab, or Bitbucket repo containing this project
- Render account (free tier works)
- Node.js project configured (already done)
- `frontend/dist` will be built during Render deploy

## 2. Overview

We deploy **one Web Service** that:
- Installs all dependencies (`npm install`)
- Builds the React frontend (`npm run build`)
- Starts the backend (`npm run start`)
- Serves both API and static files from the same service

`render.yaml` is included if you prefer infrastructure-as-code.

## 3. One-time setup using Render Dashboard

1. Push this project to GitHub.
2. Log in to [Render](https://render.com).
3. Click **New +** → **Web Service**.
4. Connect your repo.
5. Configure:
   - **Name**: `bwea-bulk-sender` (or anything)
   - **Region**: pick closest
   - **Branch**: main
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: (free or starter; Puppeteer usually needs at least Starter)
6. Environment Variables:
   - `NODE_ENV=production`
   - `VITE_API_URL=` (empty means same origin)
   - `WHATSAPP_SESSION_PATH=./.wwebjs_auth`
   - Render automatically provides `PORT` and `NODE_VERSION`.
7. Click **Create Web Service**.

Render will:
- Run `npm install` (root). `postinstall` installs backend & frontend deps.
- Run `npm run build` (builds frontend).
- Start backend (`npm run start` → `cd backend && npm start`).

## 4. Using `render.yaml` (Blueprint)

1. Commit `render.yaml`.
2. In Render dashboard: **Blueprints** → **New Blueprint Instance**.
3. Select repo & branch.
4. Render reads `render.yaml`:

```yaml
services:
  - type: web
    name: bwea-bulk-sender
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: VITE_API_URL
        value: ""
      - key: WHATSAPP_SESSION_PATH
        value: "./.wwebjs_auth"
```

Change `name`/plan if needed.

## 5. Environment Variables

| Key | Value | Notes |
| --- | ----- | ----- |
| `NODE_ENV` | `production` | Enables production config |
| `VITE_API_URL` | *(empty)* | Frontend uses same origin; set full URL if using separate frontend |
| `WHATSAPP_SESSION_PATH` | `./.wwebjs_auth` | Persisted within Render disk; consider adding persistent disk |

### Optional Vars
- `ALLOWED_ORIGINS` if you want to restrict CORS (comma-separated).
- `MESSAGES_PER_MINUTE_MAX` etc. (custom logic).

## 6. Persistent Session

WhatsApp session data lives inside `.wwebjs_auth`. To preserve sessions between deploys:

1. In Render service → **Disks** → **Add Disk** (e.g., 1GB).
2. Mount path: `/opt/render/project/src/backend/.wwebjs_auth`
3. Update `WHATSAPP_SESSION_PATH` to `/opt/render/project/src/backend/.wwebjs_auth`

## 7. Testing After Deploy

1. Visit Render-provided URL.
2. Wait for QR code.
3. Scan with WhatsApp.
4. Send a test message.
5. Check logs in Render dashboard for errors.

## 8. Local Production Test

Before pushing:

```bash
npm install
npm run build
cd backend
NODE_ENV=production PORT=4000 node src/server.js
```

Visit `http://localhost:4000`.

## 9. CI/CD Workflow

Render auto-deploys on every commit to the selected branch. To disable, toggle **Auto Deploy** in dashboard.

## 10. Troubleshooting

| Issue | Fix |
| --- | --- |
| Build fails | Check logs; ensure `npm run build` works locally |
| Puppeteer errors | Ensure instance type has enough RAM/CPU; add `--no-sandbox` (already set) |
| QR not showing | Check logs for WhatsApp client errors |
| Static files 404 | Ensure build step succeeded |
| Session lost after deploy | Use persistent disk |

## 11. Security Notes

- Render URL uses HTTPS automatically.
- Keep `WHATSAPP_SESSION_PATH` private.
- Monitor logs for suspicious usage.
- Still subject to WhatsApp’s ToS.

## 12. Next Steps

- Configure custom domain (Render dashboard → Custom Domains).
- Enable cron job for health checks if needed.
- Add alerting/monitoring via Render integrations.

---

**Summary:** Push to GitHub, create Render web service with build/start commands above, set env vars, and you’re live. Render handles Puppeteer without cPanel limitations.


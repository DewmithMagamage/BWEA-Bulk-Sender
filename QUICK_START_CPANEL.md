# 🚀 Quick Start Guide for cPanel Deployment

## ⚠️ Critical Warning

**Most shared cPanel hosting does NOT support Puppeteer/Chromium**, which is required for WhatsApp Web.js. Before proceeding, verify with your hosting provider or consider:

- **VPS with cPanel** (recommended)
- **Railway.app** or **Render.com** (easier deployment)
- **WhatsApp Business API** (official, paid solution)

---

## Quick Deployment (5 Steps)

### 1️⃣ Build Frontend Locally

```bash
cd frontend
npm install
npm run build
cd ..
```

This creates the `frontend/dist` folder with production files.

### 2️⃣ Upload to cPanel

**Option A: File Manager**
- Zip the entire project
- Upload via cPanel File Manager
- Extract in `public_html` or your domain directory

**Option B: Git (Recommended)**
- Push to GitHub/GitLab
- In cPanel, use Git Version Control to clone
- Set deployment path

**Option C: SSH**
```bash
scp -r "BWEA Bulk Sender" username@yourdomain.com:~/public_html/
```

### 3️⃣ Install Dependencies

Via SSH or cPanel Terminal:

```bash
cd ~/public_html/"BWEA Bulk Sender"
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 4️⃣ Configure Node.js App

1. In cPanel → **Node.js Selector** (or **Setup Node.js App**)
2. **Create Application**:
   - Node version: **18.x or higher**
   - Application root: `backend`
   - Startup file: `src/server.js`
   - Mode: **Production**
3. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=4000
   ```
4. Click **Create** and **Start**

### 5️⃣ Test

1. Visit your domain
2. Wait for QR code to appear
3. Scan with WhatsApp
4. Test sending a message

---

## If Chromium Installation Fails

If you see: `Could not find expected browser (chrome)`

**Solutions:**
1. **Contact hosting support** - Ask if Puppeteer/Chromium is supported
2. **Use VPS** - Get a VPS with cPanel (more control)
3. **Alternative hosting**:
   - [Railway.app](https://railway.app) - Free tier, supports Puppeteer
   - [Render.com](https://render.com) - Free tier available
   - [Heroku](https://heroku.com) - Requires credit card

---

## File Structure After Deployment

```
public_html/
└── BWEA Bulk Sender/
    ├── backend/
    │   ├── src/
    │   │   └── server.js
    │   ├── .wwebjs_auth/  (created automatically)
    │   ├── .env
    │   └── package.json
    ├── frontend/
    │   ├── dist/  (built files)
    │   └── package.json
    ├── .htaccess
    └── package.json
```

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| App won't start | Check Node.js version (18+), verify startup file path |
| QR not showing | Check logs, verify Puppeteer/Chromium installed |
| Static files 404 | Verify `frontend/dist` exists, check static serving in server.js |
| CORS errors | Frontend and backend should be on same domain |
| Port conflicts | Use cPanel assigned port, update in .env |

---

## Need Help?

1. Check **CPANEL_DEPLOYMENT.md** for detailed guide
2. Review **DEPLOYMENT_CHECKLIST.md** for step-by-step checklist
3. Check cPanel Node.js application logs
4. Contact your hosting provider

---

## Next Steps

- ✅ Set up SSL certificate (Let's Encrypt is free)
- ✅ Configure domain/subdomain
- ✅ Test all features
- ✅ Set up regular backups
- ✅ Monitor application logs

**Good luck with your deployment! 🎉**


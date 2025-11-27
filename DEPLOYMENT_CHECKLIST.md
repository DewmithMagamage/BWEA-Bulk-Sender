# 📋 cPanel Deployment Checklist

Use this checklist to ensure a smooth deployment to cPanel.

## Pre-Deployment

### Local Preparation
- [ ] Test the application locally in production mode
- [ ] Build the frontend: `cd frontend && npm run build`
- [ ] Verify all dependencies are in `package.json`
- [ ] Check that `.env.example` exists
- [ ] Review `.gitignore` to ensure sensitive files are excluded
- [ ] Run `npm run build` in frontend directory successfully

### Code Review
- [ ] API URLs are environment-aware (not hardcoded)
- [ ] CORS is configured for production
- [ ] Static file serving is configured
- [ ] Error handling is in place
- [ ] Logging is configured

## cPanel Requirements

### Hosting Requirements
- [ ] cPanel account with Node.js support
- [ ] Node.js version 18+ available
- [ ] SSH access (recommended) or Terminal access
- [ ] Sufficient disk space (at least 500MB)
- [ ] Ability to run persistent processes
- [ ] **CRITICAL**: Verify Puppeteer/Chromium support (contact hosting)

### Domain/Subdomain
- [ ] Domain or subdomain configured
- [ ] DNS records pointing correctly
- [ ] SSL certificate available (Let's Encrypt is free)

## Deployment Steps

### Step 1: Upload Files
- [ ] Upload project files to cPanel (via File Manager, Git, or SSH)
- [ ] Extract if uploaded as zip
- [ ] Verify file structure is correct

### Step 2: Install Dependencies
- [ ] Run `npm install` in root directory
- [ ] Run `npm install` in backend directory
- [ ] Run `npm install` in frontend directory
- [ ] Verify no errors during installation

### Step 3: Build Frontend
- [ ] Navigate to frontend directory
- [ ] Run `npm run build`
- [ ] Verify `frontend/dist` directory is created
- [ ] Check that `dist/index.html` exists

### Step 4: Configure Node.js App
- [ ] Go to Node.js Selector in cPanel
- [ ] Create new Node.js application
- [ ] Set Node.js version to 18.x or higher
- [ ] Set application root to: `backend` directory
- [ ] Set startup file to: `src/server.js`
- [ ] Set application mode to: Production
- [ ] Configure port (usually auto-assigned)

### Step 5: Environment Variables
- [ ] Create `.env` file in backend directory
- [ ] Set `NODE_ENV=production`
- [ ] Set `PORT` (or use cPanel assigned port)
- [ ] Set `VITE_API_URL` if needed (usually empty for same-origin)
- [ ] Add any other required variables

### Step 6: File Permissions
- [ ] Set directory permissions: `755`
- [ ] Set file permissions: `644`
- [ ] Ensure `.wwebjs_auth` directory is writable (will be created automatically)

### Step 7: Chromium/Puppeteer
- [ ] **VERIFY**: Can Puppeteer run on this hosting?
- [ ] If yes: Install Chromium dependencies
- [ ] If no: Consider alternative hosting or WhatsApp Business API
- [ ] Test Chromium installation

### Step 8: Start Application
- [ ] Start/Restart Node.js application in cPanel
- [ ] Check application logs for errors
- [ ] Verify server is listening on correct port

## Post-Deployment

### Testing
- [ ] Visit your domain - frontend loads correctly
- [ ] Check browser console for errors
- [ ] Test WhatsApp connection (QR code appears)
- [ ] Scan QR code with WhatsApp
- [ ] Verify connection status shows "Ready"
- [ ] Test sending a single message
- [ ] Test bulk sending with small number list
- [ ] Verify progress updates work
- [ ] Test report download (CSV)

### Configuration
- [ ] SSL certificate installed and working
- [ ] HTTPS redirect configured (if needed)
- [ ] CORS working correctly
- [ ] API endpoints responding
- [ ] Static files loading (CSS, JS, images)

### Security
- [ ] `.env` file is not publicly accessible
- [ ] `.wwebjs_auth` directory is protected
- [ ] Sensitive files in `.gitignore`
- [ ] HTTPS is enforced
- [ ] Error messages don't expose sensitive info

### Monitoring
- [ ] Application logs are accessible
- [ ] Error logging is working
- [ ] Resource usage is acceptable
- [ ] No memory leaks observed

## Troubleshooting

### Common Issues
- [ ] **Chromium not found**: Contact hosting or use VPS
- [ ] **Port conflicts**: Check cPanel port assignment
- [ ] **Static files 404**: Verify build output and serving config
- [ ] **CORS errors**: Check CORS configuration in server.js
- [ ] **QR not showing**: Check WhatsApp client initialization
- [ ] **App won't start**: Check logs, Node version, file paths

### Logs to Check
- [ ] cPanel Node.js application logs
- [ ] Server console output
- [ ] Browser console errors
- [ ] Network tab in browser DevTools

## Maintenance

### Regular Tasks
- [ ] Monitor application logs weekly
- [ ] Check disk space usage
- [ ] Review error logs
- [ ] Update dependencies monthly
- [ ] Backup session data (`.wwebjs_auth`)
- [ ] Test WhatsApp connection regularly

### Updates
- [ ] Keep Node.js version updated
- [ ] Update npm packages regularly
- [ ] Review security advisories
- [ ] Test updates in staging first

## Alternative Solutions

If cPanel deployment fails due to Puppeteer limitations:

- [ ] **Option 1**: Use VPS with cPanel (more control)
- [ ] **Option 2**: Deploy to Railway.app (easier, supports Puppeteer)
- [ ] **Option 3**: Deploy to Render.com (similar to Railway)
- [ ] **Option 4**: Use Heroku (requires credit card)
- [ ] **Option 5**: Use WhatsApp Business API (official, paid)

## Notes

- ⚠️ WhatsApp Web.js may violate WhatsApp ToS - use at your own risk
- ⚠️ Puppeteer requires significant resources - shared hosting often insufficient
- ✅ Consider using official WhatsApp Business API for production
- ✅ Always test thoroughly before going live
- ✅ Keep backups of session data

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

**Deployment Date**: _______________

**Deployed By**: _______________

**Notes**: 
_________________________________________________
_________________________________________________
_________________________________________________


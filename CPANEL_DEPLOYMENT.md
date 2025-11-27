# cPanel Deployment Guide for BWEA WhatsApp Bulk Sender

This guide will help you deploy the WhatsApp Bulk Message Sender application to a cPanel hosting environment.

## ⚠️ Important Considerations

### Limitations of cPanel Hosting:

1. **Puppeteer/Chromium**: Most shared cPanel hosting does NOT support Puppeteer/Chromium due to:
   - Resource limitations
   - Security restrictions
   - Missing system dependencies

2. **Node.js Support**: Your cPanel must support Node.js applications (via Passenger, Node.js Selector, or similar)

3. **Persistent Processes**: WhatsApp Web.js requires a persistent process, which may not work on all shared hosting plans

### Recommended Solutions:

- **Option 1**: Use a VPS or dedicated server with cPanel
- **Option 2**: Use a cloud service (Heroku, Railway, Render, etc.)
- **Option 3**: Use WhatsApp Business API (official, paid solution)

---

## Pre-Deployment Checklist

- [ ] Verify your cPanel supports Node.js applications
- [ ] Check if Puppeteer/Chromium can run (contact hosting support)
- [ ] Ensure you have SSH access (recommended)
- [ ] Have your domain/subdomain ready
- [ ] Backup any existing files

---

## Step-by-Step Deployment

### Step 1: Prepare Your Local Project

1. **Build the frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

2. **Test locally in production mode:**
   ```bash
   # Set environment
   export NODE_ENV=production
   
   # Start backend
   cd backend
   npm install
   npm start
   ```

3. **Create a deployment package:**
   - Compress the entire project folder (excluding `node_modules`)
   - Or use Git to push to a repository

### Step 2: Upload to cPanel

#### Method A: Using File Manager

1. Log into cPanel
2. Navigate to **File Manager**
3. Go to your domain's public directory (usually `public_html` or `domains/yourdomain.com/public_html`)
4. Upload your project files
5. Extract if you uploaded a zip file

#### Method B: Using Git (Recommended)

1. In cPanel, go to **Git Version Control**
2. Create a new repository or clone your existing one
3. Set the deployment path to your domain directory

#### Method C: Using SSH/SCP

```bash
# From your local machine
scp -r "BWEA Bulk Sender" username@yourdomain.com:~/public_html/
```

### Step 3: Install Dependencies

#### Via SSH (Recommended):

```bash
# Connect via SSH
ssh username@yourdomain.com

# Navigate to project directory
cd ~/public_html/"BWEA Bulk Sender"

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Build frontend
npm run build
```

#### Via Terminal in cPanel:

1. Go to **Terminal** in cPanel
2. Navigate to your project directory
3. Run the same commands as above

### Step 4: Configure Node.js Application

1. In cPanel, go to **Node.js Selector** (or **Setup Node.js App**)
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 18.x or higher
   - **Application root**: `/home/username/public_html/BWEA Bulk Sender/backend`
   - **Application URL**: Your domain or subdomain
   - **Application startup file**: `src/server.js`
   - **Application mode**: Production
4. Set environment variables:
   ```
   NODE_ENV=production
   PORT=4000
   ```
5. Click **Create**

### Step 5: Configure .htaccess (if needed)

If your cPanel uses Apache with mod_rewrite:

1. The `.htaccess` file is already included in the project
2. Ensure it's in the root of your public directory
3. Adjust paths if your structure differs

### Step 6: Set File Permissions

```bash
# Via SSH
chmod 755 backend
chmod 755 frontend
chmod 644 backend/src/server.js
chmod 755 backend/.wwebjs_auth  # Will be created automatically
```

### Step 7: Install Chromium (If Supported)

**⚠️ This may not work on shared hosting!**

```bash
# Try installing Chromium dependencies
cd backend
npm install puppeteer --force

# Or use system Chromium if available
# Update server.js to point to system Chrome/Chromium path
```

**Alternative**: If Chromium installation fails, you may need to:
- Contact your hosting provider
- Use a VPS instead
- Switch to WhatsApp Business API

### Step 8: Start the Application

1. In **Node.js Selector**, click **Restart** on your application
2. Check logs for any errors
3. Visit your domain to test

---

## Post-Deployment Configuration

### 1. Environment Variables

Create a `.env` file in the backend directory:

```bash
cd backend
nano .env
```

Add:
```
NODE_ENV=production
PORT=4000
```

### 2. SSL Certificate

1. In cPanel, go to **SSL/TLS Status**
2. Install a free SSL certificate (Let's Encrypt)
3. Force HTTPS redirect in `.htaccess` if needed

### 3. Domain Configuration

- Ensure your domain points to the correct directory
- Set up subdomain if needed (e.g., `whatsapp.yourdomain.com`)

---

## Troubleshooting

### Issue: "Could not find expected browser (chrome)"

**Solution**: 
- Chromium cannot be installed on shared hosting
- You need VPS or dedicated server
- Or use WhatsApp Business API instead

### Issue: Application won't start

**Check**:
1. Node.js version (must be 18+)
2. Application startup file path
3. Port configuration
4. File permissions
5. Error logs in cPanel

### Issue: QR code not showing

**Check**:
1. WhatsApp client initialization in logs
2. File permissions for `.wwebjs_auth` directory
3. Puppeteer/Chromium availability

### Issue: CORS errors

**Solution**: 
- Update CORS settings in `backend/src/server.js`
- Ensure frontend and backend are on same domain

### Issue: Static files not loading

**Check**:
1. Frontend build completed successfully
2. `frontend/dist` directory exists
3. Static file serving in `server.js`

---

## Alternative Deployment Options

### Option 1: Railway.app (Recommended for Easy Deployment)

1. Sign up at [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Railway auto-detects Node.js and deploys
4. Add environment variables
5. Deploy!

### Option 2: Render.com

1. Sign up at [Render.com](https://render.com)
2. Create new Web Service
3. Connect repository
4. Set build command: `cd frontend && npm install && npm run build`
5. Set start command: `cd backend && npm start`
6. Deploy!

### Option 3: Heroku

1. Install Heroku CLI
2. `heroku create your-app-name`
3. `git push heroku main`
4. Configure environment variables
5. Scale dyno if needed

---

## Maintenance

### Updating the Application

1. Pull latest changes (if using Git)
2. Run `npm install` in all directories
3. Rebuild frontend: `cd frontend && npm run build`
4. Restart Node.js application in cPanel

### Monitoring

- Check application logs regularly
- Monitor resource usage
- Watch for WhatsApp connection issues
- Review sending reports

### Backup

- Backup `.wwebjs_auth` directory (WhatsApp session)
- Backup database/reports if you add persistence
- Regular full backups via cPanel

---

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Session Data**: Protect `.wwebjs_auth` directory
3. **Rate Limiting**: Already implemented, but monitor usage
4. **HTTPS**: Always use SSL/TLS
5. **Access Control**: Consider adding authentication

---

## Support

If you encounter issues:
1. Check cPanel error logs
2. Review Node.js application logs
3. Contact your hosting provider
4. Verify all dependencies are installed

---

## Notes

- WhatsApp Web.js may violate WhatsApp's Terms of Service
- Use responsibly and at your own risk
- Consider using official WhatsApp Business API for production
- This application is for educational purposes

---

**Last Updated**: 2024
**Version**: 1.0.0


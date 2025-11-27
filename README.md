## WhatsApp Bulk Message Sender

This is a simple full‑stack web application for sending bulk WhatsApp text messages from your own WhatsApp account.

### Features
- Connect your WhatsApp via QR code (using `whatsapp-web.js`).
- Upload or paste phone numbers (CSV, line‑separated, comma‑separated).
- Apply a common country code prefix.
- Write a text message (supports emojis and basic formatting like `*bold*`, `_italic_`).
- Configure messages per minute (rate limiting).
- View real‑time progress (sent, remaining, failed).
- Download a CSV report of all results.

### Project Structure
- `backend/` – Node.js + Express server using `whatsapp-web.js`.
- `frontend/` – React app (Vite) UI.

### Getting Started

#### 1. Backend

```bash
cd "/Users/dewmithmagamage/Desktop/BWEA Bulk Sender/backend"
npm install
npm run dev
```

The first time you run it, the server will expose an API and emit a QR code string. The frontend will render this string as a QR image for you to scan with WhatsApp.

#### 2. Frontend

```bash
cd "/Users/dewmithmagamage/Desktop/BWEA Bulk Sender/frontend"
npm install
npm run dev
```

Open the printed local URL in your browser, scan the QR code with your WhatsApp, then paste/upload your numbers and send.

### Deployment Options

- **cPanel**: See **[CPANEL_DEPLOYMENT.md](./CPANEL_DEPLOYMENT.md)** and **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)**.
  - ⚠️ Shared cPanel often lacks Puppeteer/Chromium support. Use VPS or another platform if needed.
- **Render.com**: Fully supported and easiest path. See **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** for a step-by-step guide and use the included `render.yaml`.
- **Quick references**: `QUICK_START_CPANEL.md`, `DEPLOYMENT_SUMMARY.md`.

> **Note**: This project uses an unofficial integration (`whatsapp-web.js`) which may be against WhatsApp's Terms of Service for certain uses. Use it only for your own account, at your own risk.



const express = require('express');
const cors = require('cors');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const puppeteer = require('puppeteer');

const app = express();

// CORS configuration - allow requests from same origin in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from frontend build in production
let staticPath = null;
if (process.env.NODE_ENV === 'production') {
  staticPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(staticPath));
}

// Simple in-memory state
let client;
let isReady = false;
let lastQr = null;
let currentJob = null;

function initClient() {
  if (client) return;

  // Get Chromium executable path from puppeteer
  const executablePath = puppeteer.executablePath();

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      executablePath: executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', async (qr) => {
    lastQr = await QRCode.toDataURL(qr);
    isReady = false;
  });

  client.on('ready', () => {
    isReady = true;
    lastQr = null;
  });

  client.on('disconnected', () => {
    isReady = false;
    lastQr = null;
    client = null;
  });

  client.on('auth_failure', (msg) => {
    console.error('Authentication failed:', msg);
    isReady = false;
    lastQr = null;
  });

  client.on('error', (err) => {
    console.error('WhatsApp client error:', err);
  });

  client.initialize().catch((err) => {
    console.error('Failed to initialize WhatsApp client:', err);
  });
}

// Session routes
app.get('/api/session/status', (req, res) => {
  initClient();
  res.json({
    ready: isReady,
    hasQr: !!lastQr
  });
});

app.get('/api/session/qr', (req, res) => {
  if (!lastQr) {
    return res.status(404).json({ error: 'QR not available yet' });
  }
  res.json({ qrDataUrl: lastQr });
});

// Helpers
function normalizeNumbers(numbers, countryCode) {
  const cleaned = [];
  for (const raw of numbers) {
    if (!raw) continue;
    let n = String(raw).replace(/[^0-9]/g, '');
    if (!n) continue;
    if (countryCode && !n.startsWith(countryCode.replace('+', ''))) {
      n = countryCode.replace('+', '') + n;
    }
    cleaned.push(n);
  }
  return cleaned;
}

// Send messages
app.post('/api/messages/send', async (req, res) => {
  const { numbers, message, countryCode, messagesPerMinute } = req.body || {};

  if (!client || !isReady) {
    return res.status(400).json({ error: 'WhatsApp not connected. Scan QR first.' });
  }

  if (!Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).json({ error: 'No numbers provided' });
  }

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const rate = Number(messagesPerMinute) || 20;
  if (rate <= 0 || rate > 60) {
    return res.status(400).json({ error: 'messagesPerMinute must be between 1 and 60' });
  }

  const cleaned = normalizeNumbers(numbers, countryCode);
  if (cleaned.length === 0) {
    return res.status(400).json({ error: 'No valid numbers after cleaning' });
  }

  const delayMs = Math.round(60000 / rate);

  const jobId = Date.now().toString();
  const job = {
    id: jobId,
    total: cleaned.length,
    sent: 0,
    failed: 0,
    status: 'running',
    results: [],
    startedAt: new Date().toISOString(),
    finishedAt: null
  };
  currentJob = job;

  res.json({ jobId });

  // Fire and forget sending loop
  (async () => {
    for (const num of cleaned) {
      if (job.status !== 'running') break;
      const jid = `${num}@c.us`;
      try {
        await client.sendMessage(jid, message);
        job.sent += 1;
        job.results.push({ number: num, status: 'success', reason: null });
      } catch (err) {
        job.failed += 1;
        job.results.push({
          number: num,
          status: 'failed',
          reason: err && err.message ? err.message : 'Unknown error'
        });
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
    job.status = 'finished';
    job.finishedAt = new Date().toISOString();
  })();
});

// Progress + report
app.get('/api/messages/progress', (req, res) => {
  if (!currentJob) {
    return res.json({ hasJob: false });
  }
  const { id, total, sent, failed, status, startedAt, finishedAt } = currentJob;
  res.json({
    hasJob: true,
    id,
    total,
    sent,
    failed,
    remaining: total - sent - failed,
    status,
    startedAt,
    finishedAt
  });
});

app.get('/api/messages/report', (req, res) => {
  if (!currentJob) {
    return res.status(404).json({ error: 'No report available' });
  }
  res.json(currentJob);
});

// Serve React app for all non-API routes (SPA routing)
if (process.env.NODE_ENV === 'production' && staticPath) {
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  initClient();
});



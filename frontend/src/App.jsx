import React, { useEffect, useMemo, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000');

function parseNumbers(raw) {
  if (!raw) return [];
  return raw
    .split(/[\n,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function downloadCsv(filename, rows) {
  const header = ['Number', 'Status', 'Reason'];
  const lines = [header.join(',')];
  rows.forEach((r) => {
    const safeReason = (r.reason || '').replace(/"/g, '""');
    lines.push(`${r.number},${r.status},"${safeReason}"`);
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function App() {
  const [sessionStatus, setSessionStatus] = useState({ ready: false, hasQr: false });
  const [qrDataUrl, setQrDataUrl] = useState(null);

  const [rawNumbers, setRawNumbers] = useState('');
  const [countryCode, setCountryCode] = useState('+94');
  const [message, setMessage] = useState('');
  const [messagesPerMinute, setMessagesPerMinute] = useState(20);

  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const countNumbers = useMemo(() => parseNumbers(rawNumbers).length, [rawNumbers]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/session/status`);
        const data = await res.json();
        setSessionStatus(data);
        if (data.hasQr) {
          const qrRes = await fetch(`${BACKEND_URL}/api/session/qr`);
          const qrData = await qrRes.json();
          setQrDataUrl(qrData.qrDataUrl);
        } else if (data.ready) {
          setQrDataUrl(null);
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!sending) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/messages/progress`);
        const data = await res.json();
        if (!data.hasJob) return;
        setProgress(data);
        if (data.status === 'finished') {
          clearInterval(interval);
          setSending(false);
          const reportRes = await fetch(`${BACKEND_URL}/api/messages/report`);
          const reportData = await reportRes.json();
          setReport(reportData);
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [sending]);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setRawNumbers((prev) => (prev ? `${prev}\n${text}` : text));
    };
    reader.readAsText(file);
  };

  const handleSend = async () => {
    setError(null);
    setReport(null);

    const nums = parseNumbers(rawNumbers);
    if (nums.length === 0) {
      setError('Please add at least one phone number.');
      return;
    }
    if (!message.trim()) {
      setError('Message cannot be empty.');
      return;
    }
    if (!sessionStatus.ready) {
      setError('WhatsApp is not connected yet. Please scan the QR code first.');
      return;
    }

    const rate = Number(messagesPerMinute);
    if (!rate || rate < 1 || rate > 60) {
      setError('Messages per minute must be between 1 and 60.');
      return;
    }

    try {
      setSending(true);
      const res = await fetch(`${BACKEND_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: nums,
          message,
          countryCode,
          messagesPerMinute: rate
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setSending(false);
        setError(data.error || 'Failed to start sending.');
      } else {
        setProgress({ status: 'running' });
      }
    } catch (e) {
      setSending(false);
      setError(e.message || 'Unexpected error');
    }
  };

  const handleDownloadReport = () => {
    if (!report || !Array.isArray(report.results)) return;
    downloadCsv('bulk-whatsapp-report.csv', report.results);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>British Way English Academy</h1>
        <p className="subtitle">WhatsApp Bulk Message Sender</p>
      </header>

      <main className="layout">
        <section className="card">
          <h2>1. WhatsApp Connection</h2>
          <p className="status-line">
            Status:{' '}
            <span className={sessionStatus.ready ? 'status-pill ready' : 'status-pill not-ready'}>
              {sessionStatus.ready ? 'Connected' : 'Not connected'}
            </span>
          </p>
          {!sessionStatus.ready && (
            <>
              <p className="hint">
                Keep this browser tab open. If a QR code appears below, scan it with WhatsApp on your phone
                (Settings → Linked devices → Link a device).
              </p>
              {qrDataUrl ? (
                <div className="qr-wrapper">
                  <img src={qrDataUrl} alt="WhatsApp QR" />
                </div>
              ) : (
                <p className="muted">Waiting for QR code from backend…</p>
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2>2. Numbers</h2>
          <label className="field-label">Country code for all numbers</label>
          <div className="inline-row">
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
              <option value="+94">+94 (Sri Lanka)</option>
              <option value="+91">+91 (India)</option>
              <option value="+971">+971 (UAE)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+1">+1 (USA/Canada)</option>
              <option value="">(None – numbers already include country code)</option>
            </select>
            <span className="muted small">You can still paste full international numbers.</span>
          </div>

          <label className="field-label">Phone numbers list</label>
          <textarea
            rows={6}
            placeholder="Paste or type numbers here (comma, semicolon, or new-line separated)"
            value={rawNumbers}
            onChange={(e) => setRawNumbers(e.target.value)}
          />
          <div className="inline-row space-between">
            <div>
              <label className="upload-label">
                Upload CSV / TXT
                <input type="file" accept=".csv,.txt" onChange={handleUpload} hidden />
              </label>
              <span className="muted small">First column will be read as phone number.</span>
            </div>
            <span className="muted small">Detected numbers: {countNumbers}</span>
          </div>
        </section>

        <section className="card">
          <h2>3. Message & Settings</h2>
          <label className="field-label">Message text</label>
          <textarea
            rows={6}
            placeholder="Type the message you want to send. Use *bold* and _italic_. Emojis are supported."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="inline-row">
            <div className="field-group">
              <label className="field-label">Messages per minute</label>
              <input
                type="number"
                min={1}
                max={60}
                value={messagesPerMinute}
                onChange={(e) => setMessagesPerMinute(e.target.value)}
              />
            </div>
            <p className="muted small">
              Lower speed is safer. Avoid aggressive sending to reduce risk of WhatsApp limits.
            </p>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            className="primary-btn"
            disabled={sending || countNumbers === 0 || !message.trim()}
            onClick={handleSend}
          >
            {sending ? 'Sending…' : 'Send Messages'}
          </button>

          {progress && (
            <div className="progress-panel">
              <h3>Sending Progress</h3>
              <p>
                Status: <strong>{progress.status}</strong>
              </p>
              {typeof progress.total === 'number' && (
                <>
                  <p>
                    Sent: <strong>{progress.sent}</strong> / {progress.total}
                  </p>
                  <p>
                    Failed: <strong>{progress.failed}</strong> | Remaining:{' '}
                    <strong>{progress.remaining}</strong>
                  </p>
                </>
              )}
            </div>
          )}
        </section>

        <section className="card">
          <h2>4. Report</h2>
          {!report && <p className="muted">A detailed report will appear here after a sending run finishes.</p>}
          {report && (
            <>
              <p>
                Total numbers: <strong>{report.total}</strong> | Sent:{' '}
                <strong>{report.sent}</strong> | Failed: <strong>{report.failed}</strong>
              </p>
              <button className="secondary-btn" onClick={handleDownloadReport}>
                Download CSV Report
              </button>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Number</th>
                      <th>Status</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.results.slice(0, 100).map((row, idx) => (
                      <tr key={`${row.number}-${idx}`} className={row.status === 'failed' ? 'row-failed' : ''}>
                        <td>{row.number}</td>
                        <td>{row.status}</td>
                        <td>{row.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {report.results.length > 100 && (
                  <p className="muted small">Showing first 100 rows. Full list is in the CSV export.</p>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p className="muted small">
          This tool sends messages from your own WhatsApp session via an unofficial web integration. Use
          responsibly and at your own risk.
        </p>
      </footer>
    </div>
  );
}



/* ══════════════════════════════════════════════
   ASHISH KUMAR — PORTFOLIO BACKEND
   server.js — Node.js + Express
   Secure · Contact API · Resume Download · Admin
══════════════════════════════════════════════ */
'use strict';

const express    = require('express');
const cors       = require('cors');
const nodemailer = require('nodemailer');
const path       = require('path');
const fs         = require('fs');
const crypto     = require('crypto');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── MIDDLEWARE ── */
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

/* ── SERVE FRONTEND ── */
app.use(express.static(path.join(__dirname, 'public')));

/* ── RATE LIMITER (simple, no library) ── */
const rateLimitMap = new Map();
function rateLimit(windowMs = 60000, max = 5) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const hits = rateLimitMap.get(key) || [];
    const recent = hits.filter(t => now - t < windowMs);
    if (recent.length >= max) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please wait.' });
    }
    rateLimitMap.set(key, [...recent, now]);
    next();
  };
}

/* ── ADMIN AUTH MIDDLEWARE ── */
function adminOnly(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin key required.' });
  }
  next();
}

/* ── NODEMAILER TRANSPORTER ── */
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  transporter.verify(err => {
    if (err) console.log('⚠️  Email not connected:', err.message);
    else     console.log('✅ Email server ready');
  });
}

/* ── HELPERS ── */
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

function readJSON(file, fallback = []) {
  try { return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8')); }
  catch { return fallback; }
}
function writeJSON(file, data) {
  fs.writeFileSync(path.join(dataDir, file), JSON.stringify(data, null, 2));
}
function sanitize(str, max = 500) {
  return String(str || '').replace(/<[^>]*>/g, '').slice(0, max).trim();
}

/* ══════════════════════════════════════════════
   PUBLIC APIs
══════════════════════════════════════════════ */

/* ── POST /api/contact ── */
app.post('/api/contact', rateLimit(60000, 4), async (req, res) => {
  const name    = sanitize(req.body.name,    80);
  const email   = sanitize(req.body.email,   120);
  const company = sanitize(req.body.company, 120);
  const reason  = sanitize(req.body.reason,  40);
  const message = sanitize(req.body.message, 2000);

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }

  const reasonLabels = { job:'💼 Job Opportunity', freelance:'🧑‍💻 Freelance', collab:'🤝 Collaboration', other:'📌 Other' };

  // Log contact
  const contacts = readJSON('contacts.json');
  contacts.push({ name, email, company, reason, message, ip: req.ip, timestamp: new Date().toISOString() });
  writeJSON('contacts.json', contacts);

  // Send emails if transporter available
  if (transporter) {
    try {
      // Notification to Ashish
      await transporter.sendMail({
        from: `"Portfolio" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `📬 New Contact — ${name} · ${reasonLabels[reason] || reason || 'Portfolio'}`,
        html: `
<div style="font-family:system-ui,sans-serif;max-width:580px;margin:0 auto;background:#0d0d18;color:#e8e8f0;border-radius:16px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#7c6bff,#c084fc);padding:28px 32px">
    <h2 style="margin:0;color:#fff;font-size:20px">New Portfolio Message</h2>
  </div>
  <div style="padding:28px 32px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:10px 0;color:rgba(232,232,240,0.45);width:110px">Name</td><td style="padding:10px 0;font-weight:600">${name}</td></tr>
      <tr><td style="padding:10px 0;color:rgba(232,232,240,0.45)">Email</td><td style="padding:10px 0"><a href="mailto:${email}" style="color:#a594ff">${email}</a></td></tr>
      ${company ? `<tr><td style="padding:10px 0;color:rgba(232,232,240,0.45)">Company</td><td style="padding:10px 0">${company}</td></tr>` : ''}
      <tr><td style="padding:10px 0;color:rgba(232,232,240,0.45)">Reason</td><td style="padding:10px 0">${reasonLabels[reason] || '—'}</td></tr>
      <tr><td style="padding:10px 0;color:rgba(232,232,240,0.45);vertical-align:top">Message</td><td style="padding:10px 0;line-height:1.7">${message.replace(/\n/g,'<br>')}</td></tr>
    </table>
  </div>
</div>`,
      });

      // Auto-reply to sender
      await transporter.sendMail({
        from: `"Ashish Kumar" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Got your message! — Ashish Kumar`,
        html: `
<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto">
  <div style="background:#0d0d18;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
    <div style="font-size:32px;font-weight:800;color:#a594ff;letter-spacing:-1px">AK.</div>
    <p style="color:rgba(232,232,240,0.5);font-size:13px;margin:6px 0 0">Ashish Kumar · Full Stack Developer</p>
  </div>
  <h2 style="font-size:20px;margin-bottom:10px">Hi ${name}, thanks for reaching out!</h2>
  <p style="color:#555;line-height:1.7">I've received your message and will get back to you within <strong>24 hours</strong>.</p>
  <div style="background:#f4f4f8;border-radius:10px;padding:16px;margin:20px 0;border-left:3px solid #7c6bff">
    <p style="margin:0;font-size:13px;color:#444"><em>${message}</em></p>
  </div>
  <p style="color:#555">Check out my work: <a href="https://github.com/ashishkumar" style="color:#7c6bff">GitHub</a> · <a href="https://linkedin.com/in/ashish-kumar" style="color:#7c6bff">LinkedIn</a></p>
</div>`,
      });
    } catch (err) {
      console.error('Email error:', err.message);
      // Still success — contact is logged
    }
  }

  res.json({ success: true, message: 'Message received!' });
});

/* ── GET /resume/:file — Download resume ── */
app.get('/resume/:file', (req, res) => {
  const file = path.basename(req.params.file); // prevent path traversal
  const resumePath = path.join(__dirname, 'resume', file);
  if (!fs.existsSync(resumePath)) {
    return res.status(404).json({ message: 'Resume not found. Upload it to /resume folder.' });
  }
  console.log(`📥 Resume downloaded: ${new Date().toLocaleString()}`);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${file}"`);
  res.sendFile(resumePath);
});

/* ══════════════════════════════════════════════
   ADMIN APIs (Protected)
   Header required: x-admin-key: <ADMIN_KEY>
══════════════════════════════════════════════ */

/* ── GET  /admin/projects ── */
app.get('/admin/projects', adminOnly, (req, res) => {
  res.json(readJSON('projects.json', []));
});

/* ── POST /admin/projects ── */
app.post('/admin/projects', adminOnly, (req, res) => {
  const { title, desc, tags, emoji, color, github, demo } = req.body;
  if (!title || !desc) return res.status(400).json({ message: 'title and desc required' });
  const projects = readJSON('projects.json', []);
  const newP = {
    id: crypto.randomUUID(),
    title: sanitize(title, 100),
    desc:  sanitize(desc, 500),
    tags:  Array.isArray(tags) ? tags.map(t => sanitize(t, 30)) : [],
    emoji: sanitize(emoji, 4) || '💻',
    color: /^#[0-9a-f]{6}$/i.test(color) ? color : '#7c6bff',
    github: sanitize(github, 200),
    demo:   sanitize(demo, 200),
    createdAt: new Date().toISOString(),
  };
  projects.push(newP);
  writeJSON('projects.json', projects);
  res.json({ success: true, project: newP });
});

/* ── PUT /admin/projects/:id ── */
app.put('/admin/projects/:id', adminOnly, (req, res) => {
  const projects = readJSON('projects.json', []);
  const idx = projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Project not found' });
  const { title, desc, tags, emoji, color, github, demo } = req.body;
  projects[idx] = { ...projects[idx],
    title: sanitize(title || projects[idx].title, 100),
    desc:  sanitize(desc  || projects[idx].desc,  500),
    tags:  Array.isArray(tags) ? tags.map(t => sanitize(t, 30)) : projects[idx].tags,
    emoji: sanitize(emoji || projects[idx].emoji, 4),
    color: /^#[0-9a-f]{6}$/i.test(color) ? color : projects[idx].color,
    github: sanitize(github || projects[idx].github, 200),
    demo:   sanitize(demo   || projects[idx].demo,   200),
    updatedAt: new Date().toISOString(),
  };
  writeJSON('projects.json', projects);
  res.json({ success: true, project: projects[idx] });
});

/* ── DELETE /admin/projects/:id ── */
app.delete('/admin/projects/:id', adminOnly, (req, res) => {
  let projects = readJSON('projects.json', []);
  const before = projects.length;
  projects = projects.filter(p => p.id !== req.params.id);
  if (projects.length === before) return res.status(404).json({ message: 'Not found' });
  writeJSON('projects.json', projects);
  res.json({ success: true });
});

/* ── GET /admin/contacts ── */
app.get('/admin/contacts', adminOnly, (req, res) => {
  const contacts = readJSON('contacts.json', []);
  res.json({ count: contacts.length, contacts });
});

/* ── POST /admin/resume — Upload new resume ── */
app.post('/admin/resume', adminOnly, (req, res) => {
  // Expects base64 PDF in body: { filename, data }
  const { filename, data } = req.body;
  if (!filename || !data) return res.status(400).json({ message: 'filename and base64 data required' });
  if (!filename.endsWith('.pdf')) return res.status(400).json({ message: 'Only PDF allowed' });
  const safeFile = path.basename(filename);
  const resumeDir = path.join(__dirname, 'resume');
  if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir);
  try {
    const buf = Buffer.from(data, 'base64');
    fs.writeFileSync(path.join(resumeDir, safeFile), buf);
    res.json({ success: true, message: `Resume saved as ${safeFile}` });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed: ' + err.message });
  }
});

/* ── Serve frontend for all other routes ── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── START ── */
app.listen(PORT, () => {
  console.log(`\n🚀  Ashish Kumar Portfolio`);
  console.log(`    http://localhost:${PORT}`);
  console.log(`\n📡  APIs:`);
  console.log(`    POST   /api/contact`);
  console.log(`    GET    /resume/<filename>.pdf`);
  console.log(`    GET    /admin/projects      [admin]`);
  console.log(`    POST   /admin/projects      [admin]`);
  console.log(`    PUT    /admin/projects/:id  [admin]`);
  console.log(`    DELETE /admin/projects/:id  [admin]`);
  console.log(`    GET    /admin/contacts      [admin]`);
  console.log(`    POST   /admin/resume        [admin]\n`);
});

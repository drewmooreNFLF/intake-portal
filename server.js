require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const multer = require('multer');
const { stringify } = require('csv-stringify/sync');

const { db, seededCredentials } = require('./db');
const { FORM_SECTIONS, ALL_FIELDS, FILE_FIELDS } = require('./fields');
const T = require('./templates');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret-in-production-please';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'db');
const SESSION_DIR = DATA_DIR;
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per file
});
const uploadFormFiles = upload.fields(FILE_FIELDS.map((f) => ({ name: f.name, maxCount: 1 })));

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.db', dir: SESSION_DIR }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 12, // 12 hours
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production' && process.env.TRUST_PROXY === '1',
    },
  })
);

// ---------- helpers ----------
function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin') return res.status(403).send('Forbidden: admin access only.');
  next();
}

function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : '';
}

function setSetting(key, value) {
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, value);
}

async function maybeSendNotification(submission) {
  const host = getSetting('smtp_host');
  const port = getSetting('smtp_port');
  const smtpUser = getSetting('smtp_user');
  const smtpPass = getSetting('smtp_pass');
  const fromAddr = getSetting('smtp_from') || smtpUser;
  const toAddr = getSetting('notify_email');
  if (!host || !port || !toAddr) return; // not configured, skip silently

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
    });

    const lines = ALL_FIELDS.map((f) => `${f.label}: ${submission.data[f.name] || ''}`).join('\n');

    await transporter.sendMail({
      from: fromAddr,
      to: toAddr,
      subject: `New intake form submission from ${submission.applicant_name || submission.submitted_by}`,
      text: `Submitted by: ${submission.submitted_by}\nSubmitted at: ${submission.submitted_at}\n\n${lines}`,
    });
  } catch (err) {
    console.error('Email notification failed:', err.message);
  }
}

// ---------- auth routes ----------
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/form');
  res.send(T.loginPage({ error: null }));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get((username || '').trim());
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.send(T.loginPage({ error: 'Invalid username or password.' }));
  }
  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role,
    display_name: user.display_name,
  };
  if (user.must_change_password) return res.redirect('/account/change-password');
  res.redirect(user.role === 'admin' ? '/admin' : '/form');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.get('/', (req, res) => res.redirect(req.session.user ? '/form' : '/login'));

// ---------- account ----------
app.get('/account/change-password', requireAuth, (req, res) => {
  res.send(T.changePasswordPage({ error: null, currentUser: req.session.user }));
});

app.post('/account/change-password', requireAuth, (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.user.id);
  if (!bcrypt.compareSync(current_password || '', user.password_hash)) {
    return res.send(T.changePasswordPage({ error: 'Current password is incorrect.', currentUser: req.session.user }));
  }
  if (!new_password || new_password.length < 8) {
    return res.send(T.changePasswordPage({ error: 'New password must be at least 8 characters.', currentUser: req.session.user }));
  }
  if (new_password !== confirm_password) {
    return res.send(T.changePasswordPage({ error: 'New passwords do not match.', currentUser: req.session.user }));
  }
  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?').run(hash, user.id);
  res.redirect(user.role === 'admin' ? '/admin' : '/form');
});

// ---------- intake form ----------
app.get('/form', requireAuth, (req, res) => {
  res.send(
    T.formPage({
      sections: FORM_SECTIONS,
      fileFields: FILE_FIELDS,
      values: {},
      error: null,
      currentUser: req.session.user,
    })
  );
});

app.post('/form', requireAuth, (req, res) => {
  uploadFormFiles(req, res, (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE' ? 'One of your files is too large (20MB max per file).' : 'There was a problem uploading your files: ' + err.message;
      return res.send(
        T.formPage({
          sections: FORM_SECTIONS,
          fileFields: FILE_FIELDS,
          values: req.body || {},
          error: message,
          currentUser: req.session.user,
        })
      );
    }

    const data = {};
    ALL_FIELDS.forEach((f) => {
      data[f.name] = (req.body[f.name] || '').toString().trim();
    });

    const files = {};
    FILE_FIELDS.forEach((f) => {
      const uploaded = req.files && req.files[f.name] && req.files[f.name][0];
      if (uploaded) {
        files[f.name] = {
          originalName: uploaded.originalname,
          storedName: uploaded.filename,
          mimetype: uploaded.mimetype,
          size: uploaded.size,
        };
      }
    });

    const applicantName = data.client_name || '';

    const info = db
      .prepare(
        `INSERT INTO submissions (user_id, submitted_by, applicant_name, applicant_email, data, files)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        req.session.user.id,
        req.session.user.username,
        applicantName,
        data.client_email || '',
        JSON.stringify(data),
        JSON.stringify(files)
      );

    const submission = {
      id: info.lastInsertRowid,
      submitted_by: req.session.user.username,
      applicant_name: applicantName,
      submitted_at: new Date().toISOString(),
      data,
    };
    maybeSendNotification(submission);

    res.send(T.successPage({ applicantName, currentUser: req.session.user }));
  });
});

// ---------- admin: dashboard ----------
app.get('/admin', requireAdmin, (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const submissionCount = db.prepare('SELECT COUNT(*) AS c FROM submissions').get().c;
  res.send(T.adminDashboardPage({ userCount, submissionCount, currentUser: req.session.user }));
});

// ---------- admin: users ----------
function listUsers() {
  return db.prepare('SELECT id, username, role, display_name, created_at FROM users ORDER BY created_at DESC').all();
}

app.get('/admin/users', requireAdmin, (req, res) => {
  res.send(T.adminUsersPage({ users: listUsers(), error: null, generatedPassword: null, newUsername: null, currentUser: req.session.user }));
});

app.post('/admin/users', requireAdmin, (req, res) => {
  const { username, display_name, role } = req.body;
  const uname = (username || '').trim();
  if (!uname) {
    return res.send(T.adminUsersPage({ users: listUsers(), error: 'Username is required.', generatedPassword: null, newUsername: null, currentUser: req.session.user }));
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(uname);
  if (existing) {
    return res.send(T.adminUsersPage({ users: listUsers(), error: 'That username is already taken.', generatedPassword: null, newUsername: null, currentUser: req.session.user }));
  }

  const tempPassword = Math.random().toString(36).slice(-6) + Math.random().toString(36).slice(-6);
  const hash = bcrypt.hashSync(tempPassword, 10);
  db.prepare(
    'INSERT INTO users (username, password_hash, role, display_name, must_change_password) VALUES (?, ?, ?, ?, 1)'
  ).run(uname, hash, role === 'admin' ? 'admin' : 'user', display_name || uname);

  res.send(T.adminUsersPage({ users: listUsers(), error: null, generatedPassword: tempPassword, newUsername: uname, currentUser: req.session.user }));
});

app.post('/admin/users/:id/reset-password', requireAdmin, (req, res) => {
  const tempPassword = Math.random().toString(36).slice(-6) + Math.random().toString(36).slice(-6);
  const hash = bcrypt.hashSync(tempPassword, 10);
  db.prepare('UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?').run(hash, req.params.id);
  const target = db.prepare('SELECT username FROM users WHERE id = ?').get(req.params.id);
  res.send(
    T.adminUsersPage({
      users: listUsers(),
      error: null,
      generatedPassword: tempPassword,
      newUsername: target ? target.username : null,
      currentUser: req.session.user,
    })
  );
});

app.post('/admin/users/:id/delete', requireAdmin, (req, res) => {
  if (Number(req.params.id) === req.session.user.id) {
    return res.send(
      T.adminUsersPage({
        users: listUsers(),
        error: "You can't delete your own account while logged in.",
        generatedPassword: null,
        newUsername: null,
        currentUser: req.session.user,
      })
    );
  }
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  } catch (err) {
    return res.send(
      T.adminUsersPage({
        users: listUsers(),
        error: 'Could not delete that user: ' + err.message,
        generatedPassword: null,
        newUsername: null,
        currentUser: req.session.user,
      })
    );
  }
  res.redirect('/admin/users');
});

// ---------- admin: submissions ----------
app.get('/admin/submissions', requireAdmin, (req, res) => {
  const q = (req.query.q || '').trim();
  let rows;
  if (q) {
    const like = `%${q}%`;
    rows = db
      .prepare(
        `SELECT * FROM submissions WHERE applicant_name LIKE ? OR applicant_email LIKE ? OR submitted_by LIKE ?
         ORDER BY submitted_at DESC`
      )
      .all(like, like, like);
  } else {
    rows = db.prepare('SELECT * FROM submissions ORDER BY submitted_at DESC').all();
  }
  res.send(T.adminSubmissionsPage({ rows, q, currentUser: req.session.user }));
});

app.get('/admin/submissions/export.csv', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM submissions ORDER BY submitted_at DESC').all();
  const header = [
    'id',
    'submitted_by',
    'submitted_at',
    ...ALL_FIELDS.map((f) => f.name),
    ...FILE_FIELDS.map((f) => f.name + '_filename'),
  ];
  const records = rows.map((r) => {
    const data = JSON.parse(r.data);
    const files = JSON.parse(r.files || '{}');
    return [
      r.id,
      r.submitted_by,
      r.submitted_at,
      ...ALL_FIELDS.map((f) => data[f.name] || ''),
      ...FILE_FIELDS.map((f) => (files[f.name] ? files[f.name].originalName : '')),
    ];
  });
  const csv = stringify([header, ...records]);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="submissions-${Date.now()}.csv"`);
  res.send(csv);
});

app.get('/admin/submissions/:id', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).send('Not found');
  const data = JSON.parse(row.data);
  const files = JSON.parse(row.files || '{}');
  res.send(
    T.adminSubmissionDetailPage({ row, data, files, sections: FORM_SECTIONS, fileFields: FILE_FIELDS, currentUser: req.session.user })
  );
});

app.get('/admin/submissions/:id/download/:field', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).send('Not found');
  const files = JSON.parse(row.files || '{}');
  const meta = files[req.params.field];
  if (!meta || !FILE_FIELDS.some((f) => f.name === req.params.field)) return res.status(404).send('No file for this field');
  const filePath = path.join(UPLOAD_DIR, meta.storedName);
  if (!fs.existsSync(filePath)) return res.status(404).send('File no longer exists on the server.');
  res.download(filePath, meta.originalName);
});

// ---------- admin: settings (email notifications) ----------
app.get('/admin/settings', requireAdmin, (req, res) => {
  const settings = {
    smtp_host: getSetting('smtp_host'),
    smtp_port: getSetting('smtp_port'),
    smtp_user: getSetting('smtp_user'),
    smtp_pass: getSetting('smtp_pass'),
    smtp_from: getSetting('smtp_from'),
    notify_email: getSetting('notify_email'),
  };
  res.send(T.adminSettingsPage({ settings, saved: false, currentUser: req.session.user }));
});

app.post('/admin/settings', requireAdmin, (req, res) => {
  const fields = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from', 'notify_email'];
  fields.forEach((f) => setSetting(f, (req.body[f] || '').trim()));
  const settings = {};
  fields.forEach((f) => (settings[f] = getSetting(f)));
  res.send(T.adminSettingsPage({ settings, saved: true, currentUser: req.session.user }));
});

// ---------- fallbacks ----------
app.use((req, res) => {
  res.status(404).send('Not found.');
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Something went wrong. Please try again.');
});

app.listen(PORT, () => {
  console.log(`Intake app listening on port ${PORT}`);
  if (seededCredentials) {
    console.log('=================================================');
    console.log('First run: a default admin account was created.');
    console.log(`  Username: ${seededCredentials.username}`);
    console.log(`  Password: ${seededCredentials.password}`);
    console.log('Log in and change it right away from the Admin panel.');
    console.log('=================================================');
  }
});

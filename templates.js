// Plain string-based HTML templates. No template engine / subfolders required,
// so the whole app deploys as a small set of flat files.

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const STYLE = `
:root {
  --bg: #f5f6f8; --card: #ffffff; --border: #e2e5ea; --text: #1f2430;
  --muted: #6b7280; --primary: #2f5df5; --primary-dark: #2447c9;
  --danger: #d1435b; --success: #1c8a5a; --radius: 10px;
}
* { box-sizing: border-box; }
body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; background:var(--bg); color:var(--text); }
.topbar { display:flex; align-items:center; justify-content:space-between; padding:14px 28px; background:var(--card); border-bottom:1px solid var(--border); }
.topbar .brand { font-weight:600; font-size:16px; }
.topbar nav a { margin-left:18px; color:var(--muted); text-decoration:none; font-size:14px; }
.topbar nav a:hover { color:var(--primary); }
.topbar .user-pill { font-size:13px; color:var(--muted); margin-right:12px; }
.wrap { max-width:880px; margin:40px auto; padding:0 20px; }
.wrap.wide { max-width:1080px; }
.card { background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:28px 32px; margin-bottom:24px; }
.centered-card { max-width:400px; margin:80px auto; }
h1 { font-size:22px; margin:0 0 6px; }
h2 { font-size:17px; margin:0 0 16px; }
p.subtitle { color:var(--muted); margin:0 0 24px; font-size:14px; }
.section-title { font-size:13px; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); margin:28px 0 12px; border-bottom:1px solid var(--border); padding-bottom:6px; }
.section-title:first-of-type { margin-top:0; }
.field-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px 20px; }
.field { display:flex; flex-direction:column; }
.field.full { grid-column:1/-1; }
label { font-size:13px; font-weight:500; margin-bottom:6px; }
label .req { color:var(--danger); }
input[type=text],input[type=email],input[type=tel],input[type=date],input[type=number],input[type=password],select,textarea {
  padding:9px 11px; border:1px solid var(--border); border-radius:7px; font-size:14px; font-family:inherit; background:#fff; color:var(--text);
}
textarea { min-height:80px; resize:vertical; }
input:focus,select:focus,textarea:focus { outline:2px solid var(--primary); outline-offset:1px; }
.consent-row { display:flex; align-items:flex-start; gap:10px; margin-top:24px; padding:14px; background:#f9fafb; border-radius:8px; border:1px solid var(--border); }
.consent-row input { margin-top:3px; }
.consent-row label { font-weight:400; margin:0; font-size:13.5px; }
button,.btn { display:inline-block; background:var(--primary); color:#fff; border:none; padding:10px 20px; border-radius:7px; font-size:14px; font-weight:500; cursor:pointer; text-decoration:none; }
button:hover,.btn:hover { background:var(--primary-dark); }
button.secondary,.btn.secondary { background:#fff; color:var(--text); border:1px solid var(--border); }
button.secondary:hover,.btn.secondary:hover { background:#f3f4f6; }
button.danger,.btn.danger { background:var(--danger); }
button.danger:hover { background:#b5324a; }
.actions-row { margin-top:28px; display:flex; gap:10px; }
.alert { padding:12px 14px; border-radius:8px; font-size:13.5px; margin-bottom:18px; }
.alert.error { background:#fdecef; color:var(--danger); border:1px solid #f6c6ce; }
.alert.success { background:#e9f8f1; color:var(--success); border:1px solid #bfe8d3; }
table { width:100%; border-collapse:collapse; font-size:13.5px; }
th,td { text-align:left; padding:10px 12px; border-bottom:1px solid var(--border); }
th { color:var(--muted); font-weight:600; font-size:12.5px; text-transform:uppercase; letter-spacing:.03em; }
tr:hover td { background:#fafbfc; }
.pill { display:inline-block; padding:2px 9px; border-radius:999px; font-size:11.5px; font-weight:600; }
.pill.admin { background:#eef2ff; color:var(--primary-dark); }
.pill.user { background:#f0f1f3; color:var(--muted); }
.dash-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px; }
.stat-card { text-align:center; padding:24px; }
.stat-card .num { font-size:32px; font-weight:700; }
.stat-card .label { color:var(--muted); font-size:13px; margin-top:4px; }
.search-row { display:flex; gap:10px; margin-bottom:18px; }
.search-row input { flex:1; }
form.inline { display:inline; }
.credential-box { background:#fffbea; border:1px solid #f3d98b; border-radius:8px; padding:14px 16px; font-size:13.5px; margin-bottom:18px; }
.credential-box code { background:#fff; padding:1px 6px; border-radius:4px; border:1px solid #eee; }
.detail-grid { display:grid; grid-template-columns:220px 1fr; gap:10px 16px; font-size:14px; }
.detail-grid dt { color:var(--muted); }
.detail-grid dd { margin:0; }
.small { font-size:12.5px; color:var(--muted); }
@media (max-width:640px) { .field-grid{grid-template-columns:1fr;} .dash-grid{grid-template-columns:1fr;} .wrap{margin:20px auto;} }
`;

function layout({ title = 'Intake Portal', body = '', currentUser = null }) {
  const nav = currentUser
    ? `<span class="user-pill">${escapeHtml(currentUser.display_name || currentUser.username)} &middot; ${currentUser.role}</span>
       <a href="/form">Form</a>
       ${currentUser.role === 'admin' ? '<a href="/admin">Admin</a>' : ''}
       <a href="/account/change-password">Change Password</a>
       <form class="inline" method="POST" action="/logout" style="display:inline">
         <button type="submit" class="secondary" style="margin-left:14px;padding:6px 14px;font-size:13px;">Log out</button>
       </form>`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>${STYLE}</style>
</head>
<body>
${currentUser ? `<div class="topbar"><div class="brand">Intake Portal</div><nav>${nav}</nav></div>` : ''}
${body}
</body>
</html>`;
}

function loginPage({ error }) {
  return layout({
    title: 'Log In · Intake Portal',
    body: `
    <div class="wrap">
      <div class="card centered-card">
        <h1>Intake Portal</h1>
        <p class="subtitle">Sign in with your assigned username and password.</p>
        ${error ? `<div class="alert error">${escapeHtml(error)}</div>` : ''}
        <form method="POST" action="/login">
          <div class="field" style="margin-bottom:14px;">
            <label>Username</label>
            <input type="text" name="username" required autofocus />
          </div>
          <div class="field" style="margin-bottom:20px;">
            <label>Password</label>
            <input type="password" name="password" required />
          </div>
          <button type="submit" style="width:100%;">Log In</button>
        </form>
      </div>
    </div>`,
  });
}

function changePasswordPage({ error, currentUser }) {
  return layout({
    title: 'Change Password',
    currentUser,
    body: `
    <div class="wrap">
      <div class="card centered-card">
        <h1>Change Password</h1>
        <p class="subtitle">Choose a new password for your account.</p>
        ${error ? `<div class="alert error">${escapeHtml(error)}</div>` : ''}
        <form method="POST" action="/account/change-password">
          <div class="field" style="margin-bottom:14px;">
            <label>Current Password</label>
            <input type="password" name="current_password" required />
          </div>
          <div class="field" style="margin-bottom:14px;">
            <label>New Password</label>
            <input type="password" name="new_password" required minlength="8" />
          </div>
          <div class="field" style="margin-bottom:20px;">
            <label>Confirm New Password</label>
            <input type="password" name="confirm_password" required minlength="8" />
          </div>
          <button type="submit" style="width:100%;">Update Password</button>
        </form>
      </div>
    </div>`,
  });
}

function successPage({ applicantName, currentUser }) {
  return layout({
    title: 'Submitted',
    currentUser,
    body: `
    <div class="wrap">
      <div class="card">
        <div class="alert success">Thank you${applicantName ? `, ${escapeHtml(applicantName)}` : ''} — your application has been submitted successfully.</div>
        <a class="btn" href="/form">Submit Another Response</a>
      </div>
    </div>`,
  });
}

function fieldHtml(f, values) {
  const val = escapeHtml(values[f.name] || '');
  const req = f.required ? 'required' : '';
  const reqMark = f.required ? ' <span class="req">*</span>' : '';
  if (f.type === 'select') {
    const opts = f.options
      .map((opt) => `<option value="${escapeHtml(opt)}" ${values[f.name] === opt ? 'selected' : ''}>${escapeHtml(opt) || '-- Select --'}</option>`)
      .join('');
    return `<div class="field">
      <label for="${f.name}">${escapeHtml(f.label)}${reqMark}</label>
      <select id="${f.name}" name="${f.name}" ${req}>${opts}</select>
    </div>`;
  }
  if (f.type === 'textarea') {
    return `<div class="field full">
      <label for="${f.name}">${escapeHtml(f.label)}${reqMark}</label>
      <textarea id="${f.name}" name="${f.name}" ${req}>${val}</textarea>
    </div>`;
  }
  return `<div class="field">
    <label for="${f.name}">${escapeHtml(f.label)}${reqMark}</label>
    <input type="${f.type}" id="${f.name}" name="${f.name}" value="${val}" ${req} />
  </div>`;
}

function formPage({ sections, consentField, values, error, currentUser }) {
  const sectionsHtml = sections
    .map(
      (s) => `
      <div class="section-title">${escapeHtml(s.title)}</div>
      <div class="field-grid">
        ${s.fields.map((f) => fieldHtml(f, values)).join('\n')}
      </div>`
    )
    .join('\n');

  return layout({
    title: 'Intake Form',
    currentUser,
    body: `
    <div class="wrap">
      <div class="card">
        <h1>Applicant Intake Form</h1>
        <p class="subtitle">Please complete all required fields marked with <span style="color:#d1435b">*</span>.</p>
        ${error ? `<div class="alert error">${escapeHtml(error)}</div>` : ''}
        <form method="POST" action="/form">
          ${sectionsHtml}
          <div class="consent-row">
            <input type="checkbox" id="consent" name="consent" value="yes" ${values.consent ? 'checked' : ''} />
            <label for="consent">${escapeHtml(consentField.label)}</label>
          </div>
          <div class="actions-row">
            <button type="submit">Submit Application</button>
          </div>
        </form>
      </div>
    </div>`,
  });
}

function adminDashboardPage({ userCount, submissionCount, currentUser }) {
  return layout({
    title: 'Admin · Dashboard',
    currentUser,
    body: `
    <div class="wrap">
      <div class="card">
        <h1>Admin Dashboard</h1>
        <p class="subtitle">Manage users, review submissions, and configure email notifications.</p>
        <div class="dash-grid">
          <div class="card stat-card"><div class="num">${userCount}</div><div class="label">User Accounts</div></div>
          <div class="card stat-card"><div class="num">${submissionCount}</div><div class="label">Form Submissions</div></div>
        </div>
        <div class="actions-row">
          <a class="btn" href="/admin/users">Manage Users</a>
          <a class="btn secondary" href="/admin/submissions">View Submissions</a>
          <a class="btn secondary" href="/admin/settings">Email Settings</a>
        </div>
      </div>
    </div>`,
  });
}

function adminUsersPage({ users, error, generatedPassword, newUsername, currentUser }) {
  const rows = users
    .map(
      (u) => `
      <tr>
        <td>${escapeHtml(u.username)}</td>
        <td>${escapeHtml(u.display_name || '')}</td>
        <td><span class="pill ${u.role}">${u.role}</span></td>
        <td class="small">${escapeHtml(u.created_at)}</td>
        <td>
          <form class="inline" method="POST" action="/admin/users/${u.id}/reset-password" onsubmit="return confirm('Reset password for ${escapeHtml(u.username)}?');">
            <button type="submit" class="secondary" style="padding:5px 10px;font-size:12.5px;">Reset Password</button>
          </form>
          <form class="inline" method="POST" action="/admin/users/${u.id}/delete" onsubmit="return confirm('Delete user ${escapeHtml(u.username)}? This cannot be undone.');">
            <button type="submit" class="danger" style="padding:5px 10px;font-size:12.5px;">Delete</button>
          </form>
        </td>
      </tr>`
    )
    .join('\n');

  return layout({
    title: 'Admin · Users',
    currentUser,
    body: `
    <div class="wrap wide">
      <div class="card">
        <h1>User Accounts</h1>
        <p class="subtitle">Add a user, then share their temporary password with them securely. They'll be required to set their own password on first login.</p>
        ${error ? `<div class="alert error">${escapeHtml(error)}</div>` : ''}
        ${
          generatedPassword
            ? `<div class="credential-box">Temporary credentials for <strong>${escapeHtml(newUsername)}</strong>:<br/>
               Username: <code>${escapeHtml(newUsername)}</code> &nbsp; Password: <code>${escapeHtml(generatedPassword)}</code>
               <div class="small" style="margin-top:6px;">This password is shown once. Copy it now and send it to the user directly.</div></div>`
            : ''
        }
        <form method="POST" action="/admin/users" class="field-grid" style="margin-bottom:24px;align-items:end;">
          <div class="field"><label>Username</label><input type="text" name="username" required /></div>
          <div class="field"><label>Display Name</label><input type="text" name="display_name" /></div>
          <div class="field"><label>Role</label>
            <select name="role"><option value="user">User</option><option value="admin">Admin</option></select>
          </div>
          <div class="field"><button type="submit">Add User</button></div>
        </form>
        <table>
          <thead><tr><th>Username</th><th>Display Name</th><th>Role</th><th>Created</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`,
  });
}

function adminSubmissionsPage({ rows, q, currentUser }) {
  const trs = rows
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.applicant_name || '(no name)')}</td>
        <td>${escapeHtml(r.applicant_email)}</td>
        <td>${escapeHtml(r.submitted_by)}</td>
        <td class="small">${escapeHtml(r.submitted_at)}</td>
        <td><a class="btn secondary" style="padding:5px 10px;font-size:12.5px;" href="/admin/submissions/${r.id}">View</a></td>
      </tr>`
    )
    .join('\n');

  return layout({
    title: 'Admin · Submissions',
    currentUser,
    body: `
    <div class="wrap wide">
      <div class="card">
        <h1>Submissions</h1>
        <p class="subtitle">All intake form submissions across every user.</p>
        <form method="GET" action="/admin/submissions" class="search-row">
          <input type="text" name="q" placeholder="Search by applicant name, email, or submitted-by user" value="${escapeHtml(q)}" />
          <button type="submit" class="secondary">Search</button>
          <a class="btn" href="/admin/submissions/export.csv">Export All to CSV</a>
        </form>
        <table>
          <thead><tr><th>Applicant</th><th>Email</th><th>Submitted By</th><th>Submitted At</th><th></th></tr></thead>
          <tbody>${trs || '<tr><td colspan="5" class="small">No submissions yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`,
  });
}

function adminSubmissionDetailPage({ row, data, sections, currentUser }) {
  const sectionsHtml = sections
    .map(
      (s) => `
      <div class="section-title">${escapeHtml(s.title)}</div>
      <dl class="detail-grid" style="margin-bottom:16px;">
        ${s.fields.map((f) => `<dt>${escapeHtml(f.label)}</dt><dd>${escapeHtml(data[f.name]) || '&mdash;'}</dd>`).join('\n')}
      </dl>`
    )
    .join('\n');

  return layout({
    title: 'Submission Detail',
    currentUser,
    body: `
    <div class="wrap">
      <div class="card">
        <h1>${escapeHtml(row.applicant_name || 'Submission #' + row.id)}</h1>
        <p class="subtitle">Submitted by ${escapeHtml(row.submitted_by)} on ${escapeHtml(row.submitted_at)}</p>
        ${sectionsHtml}
        <div class="actions-row"><a class="btn secondary" href="/admin/submissions">Back to Submissions</a></div>
      </div>
    </div>`,
  });
}

function adminSettingsPage({ settings, saved, currentUser }) {
  return layout({
    title: 'Admin · Email Settings',
    currentUser,
    body: `
    <div class="wrap">
      <div class="card">
        <h1>Email Notifications</h1>
        <p class="subtitle">Optionally configure SMTP so an email is sent every time someone submits the form. Leave blank to disable notifications — submissions are always saved regardless.</p>
        ${saved ? '<div class="alert success">Settings saved.</div>' : ''}
        <form method="POST" action="/admin/settings">
          <div class="field-grid">
            <div class="field"><label>SMTP Host</label><input type="text" name="smtp_host" value="${escapeHtml(settings.smtp_host)}" placeholder="smtp.gmail.com" /></div>
            <div class="field"><label>SMTP Port</label><input type="text" name="smtp_port" value="${escapeHtml(settings.smtp_port)}" placeholder="587" /></div>
            <div class="field"><label>SMTP Username</label><input type="text" name="smtp_user" value="${escapeHtml(settings.smtp_user)}" /></div>
            <div class="field"><label>SMTP Password</label><input type="password" name="smtp_pass" value="${escapeHtml(settings.smtp_pass)}" /></div>
            <div class="field"><label>From Address</label><input type="text" name="smtp_from" value="${escapeHtml(settings.smtp_from)}" placeholder="noreply@yourdomain.com" /></div>
            <div class="field"><label>Notify This Email On Submission</label><input type="text" name="notify_email" value="${escapeHtml(settings.notify_email)}" placeholder="you@yourdomain.com" /></div>
          </div>
          <div class="actions-row"><button type="submit">Save Settings</button></div>
        </form>
      </div>
    </div>`,
  });
}

module.exports = {
  escapeHtml,
  loginPage,
  changePasswordPage,
  successPage,
  formPage,
  adminDashboardPage,
  adminUsersPage,
  adminSubmissionsPage,
  adminSubmissionDetailPage,
  adminSettingsPage,
};

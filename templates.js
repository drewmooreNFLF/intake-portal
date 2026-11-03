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
.dash-grid.three { grid-template-columns:1fr 1fr 1fr; }
.inv-scroll { overflow-x:auto; margin:0 -4px; }
table.inv { min-width:900px; }
table.inv th, table.inv td { padding:5px 4px; border-bottom:1px solid #eef0f3; }
table.inv tr:hover td { background:transparent; }
table.inv th.group { text-align:center; color:var(--text); border-bottom:2px solid var(--primary); }
table.inv td.rownum { width:32px; color:var(--muted); text-align:right; font-size:12.5px; }
table.inv input { width:100%; padding:7px 8px; font-size:13.5px; }
table.inv input.state { text-transform:uppercase; }
table.inv input.amount { text-align:right; }
table.inv button.rm { background:none; color:var(--muted); padding:4px 8px; font-size:17px; line-height:1; }
table.inv button.rm:hover { color:var(--danger); background:none; }
.inv-footer { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-top:16px; }
.inv-totals { font-size:14px; } .inv-totals strong { font-size:16px; }
td.num, th.num { text-align:right; }
@media (max-width:640px) { .field-grid{grid-template-columns:1fr;} .dash-grid,.dash-grid.three{grid-template-columns:1fr;} .wrap{margin:20px auto;} }
`;

function canSee(user, form) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const access = user.form_access || 'all';
  return access === 'all' || access === form;
}

function layout({ title = 'New Future Legal Funding', body = '', currentUser = null }) {
  const nav = currentUser
    ? `<span class="user-pill">${escapeHtml(currentUser.display_name || currentUser.username)} &middot; ${currentUser.role}</span>
       ${canSee(currentUser, 'application') ? '<a href="/form">Funding Application</a>' : ''}
       ${canSee(currentUser, 'invoices') ? '<a href="/invoices">Invoice List</a>' : ''}
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
${currentUser ? `<div class="topbar"><div class="brand">New Future Legal Funding</div><nav>${nav}</nav></div>` : ''}
${body}
</body>
</html>`;
}

function loginPage({ error }) {
  return layout({
    title: 'Log In · New Future Legal Funding',
    body: `
    <div class="wrap">
      <div class="card centered-card">
        <h1>New Future Legal Funding</h1>
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

function fileFieldHtml(f) {
  return `<div class="field">
    <label for="${f.name}">${escapeHtml(f.label)}</label>
    <input type="file" id="${f.name}" name="${f.name}" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
  </div>`;
}

function formPage({ sections, fileFields, values, error, currentUser }) {
  const sectionsHtml = sections
    .map(
      (s) => `
      <div class="section-title">${escapeHtml(s.title)}</div>
      <div class="field-grid">
        ${s.fields.map((f) => fieldHtml(f, values)).join('\n')}
      </div>`
    )
    .join('\n');

  const fileSectionHtml = fileFields
    ? `
      <div class="section-title">Supporting Documents</div>
      <p class="small" style="margin-top:-8px;margin-bottom:14px;">Optional here, but please attach as soon as they're available (20MB max per file).</p>
      <div class="field-grid">
        ${fileFields.map((f) => fileFieldHtml(f)).join('\n')}
      </div>`
    : '';

  return layout({
    title: 'Funding Application',
    currentUser,
    body: `
    <div class="wrap">
      <div class="card">
        <h1>Funding Application</h1>
        <p class="subtitle" style="margin-bottom:4px;">All information submitted is considered confidential and will not be shared.</p>
        <p class="subtitle">Please complete all required fields marked with <span style="color:#d1435b">*</span>.</p>
        ${error ? `<div class="alert error">${escapeHtml(error)}</div>` : ''}
        <form method="POST" action="/form" enctype="multipart/form-data">
          ${sectionsHtml}
          ${fileSectionHtml}
          <div class="actions-row">
            <button type="submit">Submit Application</button>
          </div>
        </form>
      </div>
    </div>`,
  });
}

function adminDashboardPage({ userCount, submissionCount, invoiceListCount, currentUser }) {
  return layout({
    title: 'Admin · Dashboard',
    currentUser,
    body: `
    <div class="wrap">
      <div class="card">
        <h1>Admin Dashboard</h1>
        <p class="subtitle">Manage users, review submissions, and configure email notifications.</p>
        <div class="dash-grid three">
          <div class="card stat-card"><div class="num">${userCount}</div><div class="label">User Accounts</div></div>
          <div class="card stat-card"><div class="num">${submissionCount}</div><div class="label">Funding Applications</div></div>
          <div class="card stat-card"><div class="num">${invoiceListCount}</div><div class="label">Invoice Lists</div></div>
        </div>
        <div class="actions-row">
          <a class="btn" href="/admin/users">Manage Users</a>
          <a class="btn secondary" href="/admin/submissions">View Submissions</a>
          <a class="btn secondary" href="/admin/invoices">View Invoice Lists</a>
          <a class="btn secondary" href="/admin/settings">Email Settings</a>
        </div>
      </div>
    </div>`,
  });
}

function accessSelect(options, selected, attrs = '') {
  return `<select name="form_access" ${attrs}>${options
    .map((o) => `<option value="${o.value}" ${o.value === (selected || 'all') ? 'selected' : ''}>${escapeHtml(o.label)}</option>`)
    .join('')}</select>`;
}

function adminUsersPage({ users, error, notice, generatedPassword, newUsername, accessOptions, currentUser }) {
  const rows = users
    .map(
      (u) => `
      <tr>
        <td>${escapeHtml(u.username)}</td>
        <td>${escapeHtml(u.display_name || '')}</td>
        <td><span class="pill ${u.role}">${u.role}</span></td>
        <td>${
          u.role === 'admin'
            ? '<span class="small">All forms (admin)</span>'
            : `<form class="inline" method="POST" action="/admin/users/${u.id}/access" style="display:flex;gap:6px;align-items:center;">
                 ${accessSelect(accessOptions, u.form_access, 'style="padding:5px 8px;font-size:12.5px;"')}
                 <button type="submit" class="secondary" style="padding:5px 10px;font-size:12.5px;">Save</button>
               </form>`
        }</td>
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
        <p class="subtitle">Add a user, then share their temporary password with them securely. They'll be required to set their own password on first login. Form Access controls which form(s) each user can see; admins always see everything.</p>
        ${error ? `<div class="alert error">${escapeHtml(error)}</div>` : ''}
        ${notice ? `<div class="alert success">${escapeHtml(notice)}</div>` : ''}
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
          <div class="field"><label>Form Access</label>${accessSelect(accessOptions, 'all')}</div>
          <div class="field"><button type="submit">Add User</button></div>
        </form>
        <table>
          <thead><tr><th>Username</th><th>Display Name</th><th>Role</th><th>Form Access</th><th>Created</th><th></th></tr></thead>
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

function adminSubmissionDetailPage({ row, data, files, sections, fileFields, currentUser }) {
  const sectionsHtml = sections
    .map(
      (s) => `
      <div class="section-title">${escapeHtml(s.title)}</div>
      <dl class="detail-grid" style="margin-bottom:16px;">
        ${s.fields.map((f) => `<dt>${escapeHtml(f.label)}</dt><dd>${escapeHtml(data[f.name]) || '&mdash;'}</dd>`).join('\n')}
      </dl>`
    )
    .join('\n');

  const filesHtml = fileFields
    ? `
      <div class="section-title">Supporting Documents</div>
      <dl class="detail-grid" style="margin-bottom:16px;">
        ${fileFields
          .map((f) => {
            const meta = files && files[f.name];
            return `<dt>${escapeHtml(f.label)}</dt><dd>${
              meta
                ? `<a class="btn secondary" style="padding:4px 10px;font-size:12.5px;" href="/admin/submissions/${row.id}/download/${f.name}">Download ${escapeHtml(meta.originalName)}</a>`
                : '&mdash; not attached'
            }</dd>`;
          })
          .join('\n')}
      </dl>`
    : '';

  return layout({
    title: 'Submission Detail',
    currentUser,
    body: `
    <div class="wrap">
      <div class="card">
        <h1>${escapeHtml(row.applicant_name || 'Submission #' + row.id)}</h1>
        <p class="subtitle">Submitted by ${escapeHtml(row.submitted_by)} on ${escapeHtml(row.submitted_at)}</p>
        ${sectionsHtml}
        ${filesHtml}
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

// ---------- Invoice List ----------
function formatMoney(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function invoiceRowHtml(columns, row, i) {
  const cells = columns
    .map((c) => {
      const val = escapeHtml(row[c.name] || '');
      const attrs = [
        `name="${c.name}[]"`,
        `value="${val}"`,
        `aria-label="${escapeHtml(c.csv)} row ${i + 1}"`,
        c.maxlength ? `maxlength="${c.maxlength}"` : '',
        c.numeric ? 'inputmode="decimal" placeholder="0.00"' : '',
        `class="${c.name === 'state' ? 'state' : c.numeric ? 'amount' : ''}"`,
      ].join(' ');
      return `<td${c.width ? ` style="width:${c.width}"` : ''}><input type="text" ${attrs} /></td>`;
    })
    .join('');
  return `<tr><td class="rownum">${i + 1}</td>${cells}<td><button type="button" class="rm" title="Remove row">&times;</button></td></tr>`;
}

function invoiceFormPage({ groups, columns, rows, notes, error, maxRows, startRows, currentUser }) {
  const filled = rows && rows.length ? rows : [];
  const count = Math.max(filled.length, startRows);
  const bodyRows = Array.from({ length: count }, (_, i) => invoiceRowHtml(columns, filled[i] || {}, i)).join('\n');
  const blankRow = invoiceRowHtml(columns, {}, 0);
  const groupHeader = groups
    .map((g) => `<th class="group" colspan="${g.fields.length}">${escapeHtml(g.title)}</th>`)
    .join('');
  const colHeader = columns
    .map((c) => `<th${c.numeric ? ' class="num"' : ''}>${escapeHtml(c.label)}${c.required ? ' <span class="req" style="color:var(--danger)">*</span>' : ''}</th>`)
    .join('');

  return layout({
    title: 'Invoice List',
    currentUser,
    body: `
    <div class="wrap wide">
      <div class="card">
        <h1>Invoice List</h1>
        <p class="subtitle" style="margin-bottom:4px;">All information submitted is considered confidential and will not be shared.</p>
        <p class="subtitle">Enter one invoice per row. Fields marked <span style="color:#d1435b">*</span> are required on every row you fill in; blank rows are ignored.</p>
        ${error ? `<div class="alert error">${escapeHtml(error)}</div>` : ''}
        <form method="POST" action="/invoices" id="invoiceForm">
          <div class="inv-scroll">
            <table class="inv">
              <thead>
                <tr><th></th>${groupHeader}<th></th></tr>
                <tr><th>#</th>${colHeader}<th></th></tr>
              </thead>
              <tbody id="invRows">${bodyRows}</tbody>
            </table>
          </div>
          <div class="inv-footer">
            <div>
              <button type="button" class="secondary" id="addRow">+ Add Row</button>
              <button type="button" class="secondary" id="addTen">+ Add 10 Rows</button>
              <span class="small" style="margin-left:8px;">Up to ${maxRows} rows</span>
            </div>
            <div class="inv-totals">Invoices: <strong id="invCount">0</strong> &nbsp;&middot;&nbsp; Total: <strong id="invTotal">$0.00</strong></div>
          </div>
          <div class="section-title" style="margin-top:28px;">Notes</div>
          <div class="field full">
            <label for="notes">Anything we should know about this batch (optional)</label>
            <textarea id="notes" name="notes">${escapeHtml(notes || '')}</textarea>
          </div>
          <div class="actions-row">
            <button type="submit">Submit Invoice List</button>
          </div>
        </form>
      </div>
    </div>
    <template id="rowTpl">${blankRow}</template>
    <script>
    (function () {
      var MAX = ${Number(maxRows)};
      var tbody = document.getElementById('invRows');
      var tpl = document.getElementById('rowTpl');
      function amt(v) { var n = parseFloat(String(v).replace(/[$,\\s]/g, '')); return isNaN(n) ? 0 : n; }
      function renumber() {
        Array.prototype.forEach.call(tbody.rows, function (r, i) { r.cells[0].textContent = i + 1; });
        recalc();
      }
      function recalc() {
        var count = 0, total = 0;
        Array.prototype.forEach.call(tbody.rows, function (r) {
          var any = false;
          r.querySelectorAll('input').forEach(function (inp) { if (inp.value.trim()) any = true; });
          if (any) { count++; total += amt(r.querySelector('input.amount').value); }
        });
        document.getElementById('invCount').textContent = count;
        document.getElementById('invTotal').textContent = total.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      }
      function addRow() {
        if (tbody.rows.length >= MAX) return;
        tbody.appendChild(tpl.content.firstElementChild.cloneNode(true));
        renumber();
      }
      tbody.addEventListener('click', function (e) {
        if (!e.target.classList.contains('rm')) return;
        e.target.closest('tr').remove();
        if (!tbody.rows.length) addRow();
        renumber();
      });
      tbody.addEventListener('input', recalc);
      tbody.addEventListener('focusout', function (e) {
        if (e.target.classList.contains('amount') && e.target.value.trim()) {
          e.target.value = amt(e.target.value).toFixed(2); recalc();
        }
      });
      document.getElementById('addRow').onclick = addRow;
      document.getElementById('addTen').onclick = function () { for (var i = 0; i < 10; i++) addRow(); };
      recalc();
    })();
    </script>`,
  });
}

function invoiceSuccessPage({ count, total, currentUser }) {
  return layout({
    title: 'Invoice List Submitted',
    currentUser,
    body: `
    <div class="wrap">
      <div class="card">
        <div class="alert success">Thank you — your invoice list (${count} invoice${count === 1 ? '' : 's'}, ${escapeHtml(formatMoney(total))}) has been submitted successfully.</div>
        <a class="btn" href="/invoices">Submit Another Invoice List</a>
      </div>
    </div>`,
  });
}

function adminInvoiceListsPage({ lists, q, currentUser }) {
  const trs = lists
    .map(
      (r) => `
      <tr>
        <td>#${r.id}</td>
        <td>${escapeHtml(r.submitted_by)}</td>
        <td class="num">${r.invoice_count}</td>
        <td class="num">${escapeHtml(formatMoney(r.total_amount))}</td>
        <td class="small">${escapeHtml(r.submitted_at)}</td>
        <td><a class="btn secondary" style="padding:5px 10px;font-size:12.5px;" href="/admin/invoices/${r.id}">View</a></td>
      </tr>`
    )
    .join('\n');
  return layout({
    title: 'Admin · Invoice Lists',
    currentUser,
    body: `
    <div class="wrap wide">
      <div class="card">
        <h1>Invoice Lists</h1>
        <p class="subtitle">Every invoice list submitted through the portal.</p>
        <form method="GET" action="/admin/invoices" class="search-row">
          <input type="text" name="q" placeholder="Search by submitted-by user, insured name, or invoice number" value="${escapeHtml(q)}" />
          <button type="submit" class="secondary">Search</button>
          <a class="btn" href="/admin/invoices/export.csv">Export All to CSV</a>
        </form>
        <table>
          <thead><tr><th>List</th><th>Submitted By</th><th class="num">Invoices</th><th class="num">Total</th><th>Submitted At</th><th></th></tr></thead>
          <tbody>${trs || '<tr><td colspan="6" class="small">No invoice lists yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`,
  });
}

function adminInvoiceListDetailPage({ list, rows, groups, columns, currentUser }) {
  const groupHeader = groups.map((g) => `<th class="group" colspan="${g.fields.length}">${escapeHtml(g.title)}</th>`).join('');
  const colHeader = columns.map((c) => `<th${c.numeric ? ' class="num"' : ''}>${escapeHtml(c.label)}</th>`).join('');
  const trs = rows
    .map(
      (r, i) =>
        `<tr><td class="rownum">${i + 1}</td>${columns
          .map((c) => (c.numeric ? `<td class="num">${escapeHtml(formatMoney(r[c.name]))}</td>` : `<td>${escapeHtml(r[c.name]) || '&mdash;'}</td>`))
          .join('')}</tr>`
    )
    .join('\n');
  return layout({
    title: 'Invoice List #' + list.id,
    currentUser,
    body: `
    <div class="wrap wide">
      <div class="card">
        <h1>Invoice List #${list.id}</h1>
        <p class="subtitle">Submitted by ${escapeHtml(list.submitted_by)} on ${escapeHtml(list.submitted_at)} &middot; ${list.invoice_count} invoice${list.invoice_count === 1 ? '' : 's'} &middot; ${escapeHtml(formatMoney(list.total_amount))}</p>
        <div class="inv-scroll">
          <table class="inv">
            <thead><tr><th></th>${groupHeader}</tr><tr><th>#</th>${colHeader}</tr></thead>
            <tbody>${trs}</tbody>
            <tfoot><tr><td></td><td colspan="${columns.length - 1}" style="text-align:right;font-weight:600;">Total</td><td class="num" style="font-weight:600;">${escapeHtml(formatMoney(list.total_amount))}</td></tr></tfoot>
          </table>
        </div>
        ${list.notes ? `<div class="section-title" style="margin-top:24px;">Notes</div><p style="white-space:pre-wrap;font-size:14px;">${escapeHtml(list.notes)}</p>` : ''}
        <div class="actions-row">
          <a class="btn secondary" href="/admin/invoices">Back to Invoice Lists</a>
          <a class="btn secondary" href="/admin/invoices/${list.id}/export.csv">Download This List as CSV</a>
        </div>
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
  invoiceFormPage,
  invoiceSuccessPage,
  adminInvoiceListsPage,
  adminInvoiceListDetailPage,
};

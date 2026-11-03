# New Future Legal Funding — Funding Application Portal

A password-protected web app for New Future Legal Funding's funding
application, with multi-user login, an admin panel for managing user
accounts, submission storage with CSV export, supporting-document uploads,
and optional email notifications on each submission.

## Features

- Username/password login (no self-signup — accounts are created by an admin).
- Admin panel to add users, reset passwords, and delete accounts. Each new
  account gets a temporary password shown once, and the user must set their
  own password on first login.
- The funding application form, matching the "NFLFA Funding Application"
  paper form: client/attorney/paralegal info, case overview, liability &
  settlement, insurance info, medical & financial, funding history, and
  other disclosures — plus uploads for the Police Report, Copy of Insurance
  Coverage, and medical treatment records (20MB max per file).
- All submissions are saved and browsable/searchable in the admin panel, with
  a one-click "Export All to CSV" button and per-file download links on each
  submission's detail page.
- Optional SMTP settings (Admin → Email Settings) to email a notification for
  every new submission. Leave blank to skip email — submissions are always
  saved regardless.

## Invoice List form

A second form at `/invoices` (linked as "Invoice List" in the top bar) for
submitting a batch of invoices — one row per invoice with insured last/first
name, property address (street, city, state, zip), invoice number and amount.
It starts with 10 rows, users can add/remove rows (up to 100), and it shows a
running count and total. Admins see every list under Admin → View Invoice
Lists, with per-list detail pages and CSV export (one CSV row per invoice).
Columns are defined in `INVOICE_COLUMNS` in `fields.js`. If email settings
are configured, each invoice list also triggers a notification email.

### Form access per user

Each user has a Form Access setting (Admin → Manage Users): Both forms,
Funding Application only, or Invoice List only. Users only see links to, and
can only open, the forms they're allowed; changes take effect on their next
page load. Existing users default to Both forms. Admins always see everything.

## Running locally

```
npm install
npm start
```

The app starts on `http://localhost:3000`. On first run it creates a default
admin account and prints the username/password to the console — log in and
change the password immediately (you'll be forced to on first login).

## Deploying

This is a standard Node.js/Express app — deploy it to any host that runs
Node (Render, Railway, Fly.io, a VPS, etc.).

- Build command: `npm install`
- Start command: `npm start`
- Set the `SESSION_SECRET` environment variable to a long random string.
- **Persistent storage matters.** This app stores everything — user accounts,
  submissions, sessions, and uploaded documents (police reports, insurance
  copies, medical records) — on local disk. Many free hosting tiers wipe
  local disk on every deploy/restart. If your host offers a persistent disk,
  mount it and set the `DATA_DIR` environment variable to that mount path
  (e.g. `DATA_DIR=/var/data`) so your data survives restarts. Without this,
  all accounts, submissions, and uploaded files will be lost whenever the
  app restarts.

## Customizing the form fields

All 30 fields are defined in one place: `fields.js`. Edit the `FORM_SECTIONS`
array to add, remove, or relabel fields — the form page, submission detail
view, and CSV export all read from this same list automatically.

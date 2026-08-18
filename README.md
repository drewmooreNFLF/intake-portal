# Intake Portal

A password-protected web app with a 30-field applicant intake form, multi-user
login, an admin panel for managing user accounts, submission storage with CSV
export, and optional email notifications on each submission.

## Features

- Username/password login (no self-signup — accounts are created by an admin).
- Admin panel to add users, reset passwords, and delete accounts. Each new
  account gets a temporary password shown once, and the user must set their
  own password on first login.
- A 30-field intake form covering personal info, contact info, address,
  emergency contact, background, and application details.
- All submissions are saved and browsable/searchable in the admin panel, with
  a one-click "Export All to CSV" button.
- Optional SMTP settings (Admin → Email Settings) to email a notification for
  every new submission. Leave blank to skip email — submissions are always
  saved regardless.

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
- **Persistent storage matters.** This app stores everything (user accounts,
  submissions, sessions) in a local SQLite database. Many free hosting tiers
  wipe local disk on every deploy/restart. If your host offers a persistent
  disk, mount it and set the `DATA_DIR` environment variable to that mount
  path (e.g. `DATA_DIR=/var/data`) so your data survives restarts. Without
  this, all accounts and submissions will be lost whenever the app restarts.

## Customizing the form fields

All 30 fields are defined in one place: `fields.js`. Edit the `FORM_SECTIONS`
array to add, remove, or relabel fields — the form page, submission detail
view, and CSV export all read from this same list automatically.

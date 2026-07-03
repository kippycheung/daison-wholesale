# Daison Wholesale — Vercel + Neon backend setup

This turns the site into a real app with **server-side login** (multiple named users)
and a **Neon Postgres** database, so admin edits go live **instantly** for everyone —
no file download, no redeploy.

The site auto-detects the backend: when these API routes are deployed it uses the
database; with no backend (the standalone HTML file, or a plain static host) it quietly
falls back to the built-in catalogue. You don't flip any switch.

You'll need ~15 minutes and a free **Neon** account. You already have **Vercel**.

---

## 1. Put the project on GitHub
Create a new GitHub repo and push this folder to it (keep the structure as-is).
`node_modules`, `.env*`, and `.vercel` are already git-ignored.

## 2. Import the repo into Vercel
Vercel → **Add New → Project → Import** your repo.
- Framework preset: **Other**
- Build command: *(empty)* · Output dir: *(leave default)*
- Don't deploy yet — add the environment variables first (next step).

## 3. Create a Neon database
Easiest path: in your Vercel project → **Storage → Create Database → Neon** (Postgres).
Vercel will create it and add the connection variables for you. **Or** sign up at
neon.tech, create a project, and copy the **pooled** connection string.

You want the **pooled** string — it looks like:
```
postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/DB?sslmode=require
```

## 4. Set environment variables (Vercel → Settings → Environment Variables)
Add these for **Production** (and Preview if you use it):

| Variable          | Value |
|-------------------|-------|
| `DATABASE_URL`    | your Neon pooled connection string (if you used the Vercel→Neon integration it may already be set as `DATABASE_URL` or `POSTGRES_URL` — make sure a var named `DATABASE_URL` exists) |
| `SESSION_SECRET`  | a long random string. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `SETUP_SECRET`    | another random string (protects the one-time setup endpoint) |
| `ADMIN_EMAIL`     | the first admin's email, e.g. `daisonwholesale@gmail.com` |
| `ADMIN_PASSWORD`  | a strong first password (you can change it later from the admin) |

## 5. Deploy
Trigger a deploy (push, or **Deployments → Redeploy**). Vercel installs the `package.json`
dependencies and publishes the `/api` functions automatically.

## 6. Create the database tables + first admin (one time)
Run the protected setup endpoint once. Replace the host and secret:
```
curl -X POST https://YOUR-SITE.vercel.app/api/migrate \
  -H "x-setup-secret: YOUR_SETUP_SECRET"
```
You should get `{"ok":true, ... ,"adminCreated":true}`. (Safe to run again; it won't
duplicate the admin.)

## 7. Sign in and initialise the catalogue
1. Go to **https://YOUR-SITE.vercel.app/#/admin** and sign in with `ADMIN_EMAIL` /
   `ADMIN_PASSWORD`.
2. A gold banner says the database is empty — click **Initialise catalogue** to load the
   current starter products into Neon. (One time only.)
3. Done. Edit anything — it saves to the cloud and is live immediately. Add your team
   under the **Users** tab.

---

## Day-to-day
- **Editing:** Products / Categories / Site info — every change saves automatically
  (watch the "Saved to cloud" pill, top-right). Uploaded images are stored with the item.
- **Team:** **Users** tab → add people (Editor = manage catalogue, Admin = also manage
  users), reset passwords, or remove someone. You can't delete the last user.
- **Backups:** **Backup** tab → Download JSON anytime.

## Security notes (production)
- Passwords are hashed with **bcrypt**; only the hash is stored, never the plain text.
- Login issues a **signed, http-only, Secure cookie** (JWT, HS256) that lasts ~30 days;
  it can't be read by page scripts.
- After step 6 you can rotate or delete `SETUP_SECRET`, `ADMIN_EMAIL`, and
  `ADMIN_PASSWORD` — they're only needed for first-time setup.
- All admin write endpoints require a valid session; user management requires the
  **admin** role.

## Troubleshooting
- **"Server error: DATABASE_URL …"** — the env var isn't set/visible to the function;
  re-check spelling and that it's enabled for Production, then redeploy.
- **migrate returns 403** — the `x-setup-secret` header doesn't match `SETUP_SECRET`.
- **Login works but edits don't save** — your session may have expired; sign out and in.
- **Site shows starter data, admin says "empty"** — you haven't clicked **Initialise
  catalogue** yet (step 7).

## What each file does
- `api/login.js`, `api/logout.js`, `api/session.js` — authentication
- `api/users.js` — list / add / update / remove users (admin)
- `api/catalogue.js` — read (public) & save (signed-in) the whole catalogue
- `api/migrate.js` — one-time table creation + first admin
- `lib/db.js` — Neon connection · `lib/auth.js` — hashing, JWT, cookies
- `package.json` — backend dependencies · `.env.example` — variable template

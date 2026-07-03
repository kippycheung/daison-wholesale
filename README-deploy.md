# Daison Wholesale — deploying & managing the catalogue

This is a self-contained static site (HTML + React via CDN). It runs anywhere static
files are served, including **Vercel**.

## Deploy to Vercel
1. Put all these files in a folder / git repo (keep the structure as-is).
2. In Vercel: **New Project → Import** the repo. No build step — it's static.
   - Framework preset: **Other**
   - Build command: *(leave empty)*
   - Output directory: **/** (root)
3. Deploy. That's it. The site uses hash routing (`/#/catalogue`, `/#/product/...`,
   `/#/admin`) so no extra rewrites are required.

## The admin panel (login + editing)
Go to **/#/admin** (also linked in the footer). It's **password-protected**.

### Logging in
- **Default password:** `daison-admin`  ← change this right away.
- To change it: sign in → **Site info** tab → **Admin password** → set a new one →
  then **Publish** (see below) and redeploy so the new password takes effect for good.
- The password is stored as a one-way SHA-256 hash, never as plain text. Because this
  is a static site, treat the login as a front-door lock that keeps the panel private;
  the **Publish** step is what actually controls the live site (visitors can never
  change it).

### Editing — you can revise every product detail
In **Products** you can add / edit / delete any item and change all of its fields:
name, category, SKU, pack size, origin, brand, storage, tags, the Popular / Promo /
In-stock flags, short blurb, full description, and the **photo** (upload from your
computer — auto-resized — or paste an image URL). **Categories** and **Site info**
(phone, email, address, hours, announcement bar) are editable too.

### Publishing changes to the live site — 3 steps
Edits are saved in *your browser* instantly (no waiting). To push them live for everyone:
1. Admin → **Publish** tab → **Publish (download catalogue.js)**.
2. **Replace** the `catalogue.js` file in this folder with the one you just downloaded.
3. **Redeploy** — drag the folder onto Vercel, or push to your git repo. Live in ~30s.

Uploaded product images and your admin password travel inside `catalogue.js`, so they
publish the same way. After redeploying you can hit **Discard local edits** to confirm
the live site matches.

### Want edits to go live *instantly* (no redeploy)?
That needs a small backend. The data layer (`data.jsx` → `DaisonStore`) is the single
source of truth — point its `load` / `save` (and the `upsert*` / `delete*` methods) at
a real store and edits persist for everyone:
- **Vercel KV** (Redis) or **Vercel Postgres** via a serverless function in `/api`.
- Or a hosted headless CMS (Airtable, Sanity, Contentful) — fetch on load.
The admin UI and product pages won't need to change; only those store methods do. This
is also where you'd move the password check to a real server-side login.

### Contact / quote submissions
The "Get a quote" form composes an email (mailto) to the store address as a no-backend
fallback. For server-side submissions, point the form's submit handler (`misc.jsx` →
`ContactPage.submit`) at **Formspree** or a Vercel function in `/api/quote`.

## File map
- `index.html` — entry; loads fonts, CSS, `catalogue.js`, and the app
- `catalogue.js` — **the published catalogue** (replace this when you Publish)
- `data.jsx` — data store + built-in starter catalogue
- `ui.jsx` — icons, image/placeholder, logo, quote-list context, router
- `admin-auth.jsx` — admin login gate (password hash + how to change it)
- `layout.jsx` — header, footer, quote drawer
- `cards.jsx` — product card
- `home.jsx` / `catalogue.jsx` / `product.jsx` / `misc.jsx` / `admin.jsx` — pages
- `app.jsx` — router + mount
- `*.css` — styles

import { db } from "../lib/db.js";
import { hashPassword, readBody } from "../lib/auth.js";

// One-time setup. Protected by the x-setup-secret header (must equal SETUP_SECRET env var).
// Creates tables and seeds the first admin user from ADMIN_EMAIL / ADMIN_PASSWORD
// (or from the POST body { email, password, name }).
//
//   curl -X POST https://YOUR-SITE/api/migrate -H "x-setup-secret: YOUR_SETUP_SECRET"
//
// Safe to run more than once; it will not duplicate the admin.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const provided = req.headers["x-setup-secret"];
  if (!process.env.SETUP_SECRET || provided !== process.env.SETUP_SECRET) {
    return res.status(403).json({ error: "Missing or invalid x-setup-secret header" });
  }
  try {
    const sql = db();

    await sql`create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      email text unique not null,
      name text not null default '',
      password_hash text not null,
      role text not null default 'admin',
      created_at timestamptz not null default now()
    )`;

    await sql`create table if not exists catalogue (
      id int primary key default 1,
      data jsonb not null,
      updated_at timestamptz not null default now(),
      constraint catalogue_single_row check (id = 1)
    )`;

    const body = await readBody(req);
    const email = String(body.email || process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    const password = body.password || process.env.ADMIN_PASSWORD || "";
    let adminCreated = false;

    if (email && password) {
      const existing = await sql`select id from users where email = ${email}`;
      if (!existing[0]) {
        const hash = await hashPassword(password);
        await sql`insert into users (email, name, password_hash, role)
                  values (${email}, ${body.name || "Admin"}, ${hash}, 'admin')`;
        adminCreated = true;
      }
    }

    const cnt = await sql`select count(*)::int as n from users`;
    return res.status(200).json({
      ok: true,
      tables: ["users", "catalogue"],
      adminCreated,
      adminEmail: adminCreated ? email : undefined,
      userCount: cnt[0].n,
    });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
}

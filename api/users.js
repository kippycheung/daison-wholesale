import { db } from "../lib/db.js";
import { requireUser, hashPassword, readBody } from "../lib/auth.js";

// Manage named users. Any signed-in user may LIST; only admins may create/edit/remove.
export default async function handler(req, res) {
  try {
    const me = await requireUser(req, res);
    if (!me) return;
    const sql = db();

    if (req.method === "GET") {
      const rows = await sql`select id, email, name, role, created_at
                             from users order by created_at asc`;
      return res.status(200).json({ users: rows });
    }

    if (me.role !== "admin") return res.status(403).json({ error: "Admins only" });

    if (req.method === "POST") {
      const { email, name, password, role } = await readBody(req);
      if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
      if (String(password).length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
      const hash = await hashPassword(password);
      try {
        const rows = await sql`insert into users (email, name, password_hash, role)
          values (${String(email).toLowerCase().trim()}, ${name || ""}, ${hash}, ${role === "admin" ? "admin" : "editor"})
          returning id, email, name, role, created_at`;
        return res.status(201).json({ user: rows[0] });
      } catch (e) {
        if (String(e.message).toLowerCase().includes("duplicate")) {
          return res.status(409).json({ error: "A user with that email already exists" });
        }
        throw e;
      }
    }

    if (req.method === "PATCH") {
      const { id, name, password, role } = await readBody(req);
      if (!id) return res.status(400).json({ error: "id is required" });
      if (password) {
        if (String(password).length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
        const hash = await hashPassword(password);
        await sql`update users set password_hash = ${hash} where id = ${id}`;
      }
      if (name !== undefined) await sql`update users set name = ${name} where id = ${id}`;
      if (role !== undefined) await sql`update users set role = ${role === "admin" ? "admin" : "editor"} where id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const body = await readBody(req);
      const id = (req.query && req.query.id) || body.id;
      if (!id) return res.status(400).json({ error: "id is required" });
      const cnt = await sql`select count(*)::int as n from users`;
      if (cnt[0].n <= 1) return res.status(400).json({ error: "Cannot delete the last remaining user" });
      await sql`delete from users where id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
}

import { db } from "../lib/db.js";
import { verifyPassword, signSession, sessionCookie, readBody } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { email, password } = await readBody(req);
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const sql = db();
    const rows = await sql`select id, email, name, password_hash, role
                           from users where email = ${String(email).toLowerCase().trim()}`;
    const u = rows[0];
    if (!u || !(await verifyPassword(password, u.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = await signSession({ id: u.id, email: u.email, name: u.name, role: u.role });
    res.setHeader("Set-Cookie", sessionCookie(token));
    return res.status(200).json({ user: { id: u.id, email: u.email, name: u.name, role: u.role } });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
}

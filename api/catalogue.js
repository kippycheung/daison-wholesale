import { db } from "../lib/db.js";
import { requireUser, readBody } from "../lib/auth.js";

// GET  -> public: the live catalogue { categories, products, settings } (or { empty:true })
// PUT  -> signed-in: replace the whole catalogue atomically (used for instant saves)
export default async function handler(req, res) {
  try {
    const sql = db();

    if (req.method === "GET") {
      const rows = await sql`select data, updated_at from catalogue where id = 1`;
      if (!rows[0]) return res.status(200).json({ empty: true });
      const d = rows[0].data || {};
      return res.status(200).json({
        categories: d.categories || [],
        products: d.products || [],
        settings: d.settings || {},
        updatedAt: rows[0].updated_at,
      });
    }

    if (req.method === "PUT") {
      const me = await requireUser(req, res);
      if (!me) return;
      const body = await readBody(req);
      const data = {
        categories: Array.isArray(body.categories) ? body.categories : [],
        products: Array.isArray(body.products) ? body.products : [],
        settings: body.settings && typeof body.settings === "object" ? body.settings : {},
      };
      await sql`insert into catalogue (id, data, updated_at)
                values (1, ${JSON.stringify(data)}::jsonb, now())
                on conflict (id) do update set data = excluded.data, updated_at = now()`;
      return res.status(200).json({ ok: true, updatedAt: new Date().toISOString() });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
}

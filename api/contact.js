import { readBody } from "../lib/auth.js";

// Sends the quote/contact form as a real email via Resend (https://resend.com).
// Requires env var RESEND_API_KEY. Optional: CONTACT_TO, CONTACT_FROM.
// If not configured, returns 501 so the site falls back to opening the mail app.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(501).json({ error: "email-not-configured" });

  try {
    const b = await readBody(req);
    const name = String(b.name || "").trim();
    const email = String(b.email || "").trim();
    const business = String(b.business || "").trim();
    const phone = String(b.phone || "").trim();
    const message = String(b.message || "").trim();
    const items = Array.isArray(b.items) ? b.items : [];

    if (!name || !/^\S+@\S+\.\S+$/.test(email) || (!message && !items.length)) {
      return res.status(400).json({ error: "Please include your name, a valid email, and what you need." });
    }

    const to = process.env.CONTACT_TO || "daisonwholesale@gmail.com";
    const from = process.env.CONTACT_FROM || "Daison Website <onboarding@resend.dev>";

    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const itemRows = items.map((it) =>
      `<tr><td style="padding:4px 10px 4px 0">${esc(it.qty)}×</td><td style="padding:4px 0">${esc(it.name)}${it.pack ? " <span style='color:#888'>(" + esc(it.pack) + ")</span>" : ""}</td></tr>`
    ).join("");

    const html = `
      <div style="font-family:Arial,sans-serif;font-size:15px;color:#222;line-height:1.5">
        <h2 style="margin:0 0 12px">New quote request</h2>
        <table style="border-collapse:collapse;margin-bottom:14px">
          <tr><td style="padding:2px 12px 2px 0;color:#888">Name</td><td>${esc(name)}</td></tr>
          ${business ? `<tr><td style="padding:2px 12px 2px 0;color:#888">Business</td><td>${esc(business)}</td></tr>` : ""}
          <tr><td style="padding:2px 12px 2px 0;color:#888">Email</td><td>${esc(email)}</td></tr>
          ${phone ? `<tr><td style="padding:2px 12px 2px 0;color:#888">Phone</td><td>${esc(phone)}</td></tr>` : ""}
        </table>
        ${message ? `<p style="white-space:pre-wrap;margin:0 0 14px">${esc(message)}</p>` : ""}
        ${items.length ? `<h3 style="margin:16px 0 6px">Quote list (${items.reduce((n, x) => n + (x.qty || 0), 0)} items)</h3>
          <table style="border-collapse:collapse">${itemRows}</table>` : ""}
      </div>`;

    const text =
      `New quote request\n\nName: ${name}\n` +
      (business ? `Business: ${business}\n` : "") +
      `Email: ${email}\n` + (phone ? `Phone: ${phone}\n` : "") +
      (message ? `\n${message}\n` : "") +
      (items.length ? `\nQuote list:\n` + items.map((it) => `• ${it.qty} × ${it.name}${it.pack ? " (" + it.pack + ")" : ""}`).join("\n") : "");

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [to], reply_to: email,
        subject: `Quote request — ${business || name}`,
        html, text,
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return res.status(502).json({ error: "Email provider error", detail: detail.slice(0, 300) });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
}

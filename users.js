import { getUser } from "../lib/auth.js";

export default async function handler(req, res) {
  const u = await getUser(req);
  if (!u) return res.status(401).json({ error: "Not authenticated" });
  return res.status(200).json({ user: u });
}

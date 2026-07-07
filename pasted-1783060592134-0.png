// Auth helpers: password hashing (bcrypt) + signed, http-only session cookies (JWT).
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "daison_session";
const DAYS = 30;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET must be set to a long random string");
  }
  return new TextEncoder().encode(s);
}

export async function hashPassword(pw) {
  return bcrypt.hash(pw, 12);
}
export async function verifyPassword(pw, hash) {
  try { return await bcrypt.compare(pw, hash); } catch { return false; }
}

export async function signSession(user) {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${DAYS}d`)
    .sign(secret());
}

export function sessionCookie(token) {
  const maxAge = DAYS * 24 * 60 * 60;
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}
export function clearCookie() {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function readCookie(req) {
  const header = req.headers.cookie || "";
  const part = header.split(";").map((s) => s.trim()).find((s) => s.startsWith(COOKIE + "="));
  return part ? decodeURIComponent(part.slice(COOKIE.length + 1)) : null;
}

export async function getUser(req) {
  const token = readCookie(req);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}

// Returns the user, or sends 401 and returns null.
export async function requireUser(req, res) {
  const u = await getUser(req);
  if (!u) { res.status(401).json({ error: "Not authenticated" }); return null; }
  return u;
}

// Parse a JSON body whether or not the platform pre-parsed it.
export function readBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === "object") return resolve(req.body);
    if (typeof req.body === "string") { try { return resolve(JSON.parse(req.body)); } catch { return resolve({}); } }
    let data = "";
    req.on("data", (c) => { data += c; });
    req.on("end", () => { try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}

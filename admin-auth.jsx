/* ===========================================================
   DAISON WHOLESALE — Admin login gate
   -----------------------------------------------------------
   Two modes, auto-detected on load:

   • SERVER mode (Vercel + Neon): logs in against /api/login,
     session is a signed http-only cookie verified by /api/session.
     Manage users from the Users tab. This is the production path.

   • STATIC fallback (no /api backend — e.g. the standalone HTML
     file or a plain static host): a single client-side password,
     stored as a SHA-256 hash. Default password: daison-admin
     (change it in Admin → Site info).
   =========================================================== */

const ADMIN_HASH = "670fc9ca53d08eeea0b1a3ecb6240e146258f83914af2d0fb1ffa6c43141d7ba"; /* SHA-256 of "daison-admin" — used only in static fallback */

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const AUTH_KEY = "daison_admin_session";
const API = window.__API_BASE || "";

function getAdminHash() {
  try {
    const s = DaisonStore.getSettings();
    if (s && s.adminHash && /^[a-f0-9]{64}$/i.test(s.adminHash)) return s.adminHash.toLowerCase();
  } catch (e) {}
  return ADMIN_HASH;
}

function AdminGate() {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState("static"); // "server" | "static"
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // detect backend + existing session
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(API + "/api/session", { credentials: "include" });
        if (!alive) return;
        const ct = r.headers.get("content-type") || "";
        const isJson = ct.includes("application/json");
        if (r.status === 200 && isJson) { const d = await r.json(); if (d && d.user) { setMode("server"); setUser(d.user); setAuthed(true); } else { setMode("static"); setAuthed(sessionStorage.getItem(AUTH_KEY) === "1"); } }
        else if (r.status === 401 && isJson) { setMode("server"); setAuthed(false); }
        else { setMode("static"); try { setAuthed(sessionStorage.getItem(AUTH_KEY) === "1"); } catch (_) {} }
      } catch (e) {
        setMode("static");
        try { setAuthed(sessionStorage.getItem(AUTH_KEY) === "1"); } catch (_) {}
      } finally { if (alive) setReady(true); }
    })();
    return () => { alive = false; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      if (mode === "server") {
        const r = await fetch(API + "/api/login", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password: pw }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) { setErr(d.error || "Sign in failed."); setPw(""); }
        else { setUser(d.user); setAuthed(true); }
      } else {
        const h = await sha256(pw);
        if (h === getAdminHash()) { try { sessionStorage.setItem(AUTH_KEY, "1"); } catch (_) {} setAuthed(true); }
        else { setErr("Incorrect password."); setPw(""); }
      }
    } catch (e2) { setErr("Network error. Please try again."); }
    setBusy(false);
  };

  const logout = async () => {
    if (mode === "server") { try { await fetch(API + "/api/logout", { method: "POST", credentials: "include" }); } catch (_) {} }
    else { try { sessionStorage.removeItem(AUTH_KEY); } catch (_) {} }
    setAuthed(false); setUser(null); setPw("");
  };

  if (!ready) {
    return <main className="adm-login"><div className="adm-login-card" style={{ textAlign: "center" }}>
      <div className="adm-login-brand" style={{ justifyContent: "center" }}><Logo size={24} /></div>
      <p className="adm-login-sub" style={{ marginTop: 22 }}>Loading…</p>
    </div></main>;
  }

  if (authed) return <AdminPage onLogout={logout} currentUser={user} serverMode={mode === "server"} />;

  return (
    <main className="adm-login">
      <form className="adm-login-card" onSubmit={submit}>
        <div className="adm-login-brand"><Logo size={26} /></div>
        <div className="eyebrow" style={{ color: "var(--gold-600)", marginTop: 22 }}>Catalogue manager</div>
        <h1 className="adm-login-h1">Sign in to Admin</h1>
        <p className="adm-login-sub">
          {mode === "server"
            ? "Enter your email and password to manage the catalogue."
            : "Enter the admin password to manage products, categories and site info."}
        </p>

        {mode === "server" && (
          <>
            <label className="adm-login-label" htmlFor="adm-email">Email</label>
            <div className="adm-login-field">
              <Icon name="mail" size={18} />
              <input id="adm-email" type="email" value={email} autoComplete="username"
                placeholder="you@example.com" onChange={(e) => { setEmail(e.target.value); setErr(""); }} />
            </div>
          </>
        )}

        <label className="adm-login-label" htmlFor="adm-pw" style={{ marginTop: mode === "server" ? 16 : 0 }}>Password</label>
        <div className={"adm-login-field" + (err ? " err" : "")}>
          <Icon name="shield" size={18} />
          <input id="adm-pw" type="password" value={pw} autoComplete="current-password"
            placeholder="••••••••••" onChange={(e) => { setPw(e.target.value); setErr(""); }} />
        </div>
        {err && <div className="adm-login-err">{err}</div>}

        <button className="btn btn-primary btn-lg adm-login-btn" type="submit" disabled={busy || !pw || (mode === "server" && !email)}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <a href="#/" className="adm-login-back"><Icon name="arrowLeft" size={15} /> Back to site</a>
      </form>
    </main>
  );
}

Object.assign(window, { AdminGate, sha256 });

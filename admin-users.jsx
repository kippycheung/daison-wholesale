/* ===========================================================
   DAISON WHOLESALE — Admin "Users" tab (server mode only)
   Add / remove named users and reset passwords via /api/users.
   =========================================================== */

const USERS_API = (window.__API_BASE || "") + "/api/users";

function AdminUsers({ currentUser }) {
  const [users, setUsers] = useState(null);
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" });
  const [resetFor, setResetFor] = useState(null);
  const [resetPw, setResetPw] = useState("");
  const isAdmin = !currentUser || currentUser.role === "admin";

  const load = async () => {
    setErr("");
    try {
      const r = await fetch(USERS_API, { credentials: "include" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to load users");
      setUsers(d.users);
    } catch (e) { setErr(e.message); setUsers([]); }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault(); setErr("");
    try {
      const r = await fetch(USERS_API, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not add user");
      setForm({ name: "", email: "", password: "", role: "editor" });
      setAdding(false);
      load();
    } catch (e) { setErr(e.message); }
  };

  const remove = async (u) => {
    if (!confirm(`Remove ${u.email}? They will no longer be able to sign in.`)) return;
    setErr("");
    try {
      const r = await fetch(USERS_API + "?id=" + encodeURIComponent(u.id), { method: "DELETE", credentials: "include" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not remove user");
      load();
    } catch (e) { setErr(e.message); }
  };

  const resetPassword = async (u) => {
    setErr("");
    if (resetPw.length < 8) { setErr("New password must be at least 8 characters."); return; }
    try {
      const r = await fetch(USERS_API, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, password: resetPw }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not update password");
      setResetFor(null); setResetPw("");
    } catch (e) { setErr(e.message); }
  };

  return (
    <div>
      <div className="adm-bar">
        <h2 className="adm-h2">Users</h2>
        {isAdmin && !adding && (
          <button className="btn btn-primary btn-sm" onClick={() => { setAdding(true); setErr(""); }}>
            <Icon name="plus" size={16} /> Add user
          </button>
        )}
      </div>

      {!isAdmin && <p className="adm-users-note">You can view the team here. Only admins can add or remove users.</p>}
      {err && <p className="adm-import-msg bad" style={{ marginBottom: 14 }}>{err}</p>}

      {adding && (
        <form className="card adm-user-form" onSubmit={create}>
          <h3>New user</h3>
          <div className="adm-user-grid">
            <div className="adm-field"><label>Name</label>
              <input className="adm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" /></div>
            <div className="adm-field"><label>Email</label>
              <input className="adm-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" /></div>
            <div className="adm-field"><label>Temporary password</label>
              <input className="adm-input" type="text" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="at least 8 characters" /></div>
            <div className="adm-field"><label>Role</label>
              <select className="adm-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="editor">Editor — can manage the catalogue</option>
                <option value="admin">Admin — can also manage users</option>
              </select></div>
          </div>
          <div className="adm-user-form-actions">
            <button className="btn btn-primary" type="submit"><Icon name="check" size={16} /> Create user</button>
            <button className="btn btn-ghost" type="button" onClick={() => { setAdding(false); setErr(""); }}>Cancel</button>
          </div>
        </form>
      )}

      {users === null ? (
        <p className="adm-users-note">Loading users…</p>
      ) : (
        <div className="adm-user-list">
          {users.map((u) => (
            <div className="card adm-user-row" key={u.id}>
              <div className="adm-user-avatar">{(u.name || u.email || "?").slice(0, 1).toUpperCase()}</div>
              <div className="adm-user-meta">
                <div className="adm-user-name">{u.name || "—"}
                  {currentUser && u.id === currentUser.id && <span className="adm-user-you">you</span>}
                </div>
                <div className="adm-user-email">{u.email}</div>
              </div>
              <span className={"adm-user-role " + u.role}>{u.role}</span>
              {isAdmin && (
                <div className="adm-user-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => { setResetFor(resetFor === u.id ? null : u.id); setResetPw(""); setErr(""); }}>Reset password</button>
                  <button className="btn btn-ghost btn-sm adm-danger" onClick={() => remove(u)}><Icon name="trash" size={15} /></button>
                </div>
              )}
              {resetFor === u.id && (
                <div className="adm-user-reset">
                  <input className="adm-input" type="text" value={resetPw} placeholder="New password (8+ chars)" onChange={(e) => setResetPw(e.target.value)} />
                  <button className="btn btn-primary btn-sm" onClick={() => resetPassword(u)}>Save</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AdminUsers });

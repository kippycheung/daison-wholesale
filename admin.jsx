/* ===========================================================
   DAISON WHOLESALE — Admin panel (in-browser CMS)
   Products / Categories / Site info / Data (export-import)
   =========================================================== */

function emptyProduct() {
  return { id: "", name: "", category: "", sku: "", pack: "", origin: "", brand: "",
    storage: "", tags: [], featured: false, promo: false, inStock: true, image: "", short: "", description: "" };
}

function fileToDataUrl(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/* ---------------- Product editor ---------------- */
function ProductEditor({ initial, onClose }) {
  const store = useStore();
  const cats = store.getCategories();
  const [p, setP] = useState(initial);
  const [tagText, setTagText] = useState((initial.tags || []).join(", "));
  const [imgBusy, setImgBusy] = useState(false);
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));

  const onImg = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setImgBusy(true);
    try {
      let dataUrl = await fileToDataUrl(f);
      dataUrl = await downscale(dataUrl, 1100);
      set("image", dataUrl);
    } catch (err) { alert("Could not read image"); }
    setImgBusy(false);
  };

  const save = () => {
    if (!p.name.trim()) { alert("Product needs a name"); return; }
    if (!p.category) { alert("Choose a category"); return; }
    const tags = tagText.split(",").map((t) => t.trim()).filter(Boolean);
    const id = p.id || (slugify(p.name) + "-" + Math.random().toString(36).slice(2, 6));
    store.upsertProduct({ ...p, id, tags });
    onClose();
  };

  return (
    <div className="adm-modal-scrim" onClick={onClose}>
      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-head">
          <h3>{initial.id ? "Edit product" : "Add product"}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="adm-modal-body scroll-y">
          <div className="adm-img-row">
            <div className="adm-img-prev"><Img src={p.image} label="no image" rounded="12px" /></div>
            <div className="adm-img-actions">
              <label className="btn btn-ghost btn-sm">
                <Icon name="upload" size={16} /> {imgBusy ? "Processing…" : "Upload image"}
                <input type="file" accept="image/*" onChange={onImg} hidden />
              </label>
              {p.image && <button className="btn btn-ghost btn-sm" onClick={() => set("image", "")}>Remove</button>}
              <p className="adm-hint">Or paste an image URL below. Images are stored with your catalogue.</p>
              <input className="adm-input" placeholder="https://… image URL"
                value={p.image && p.image.startsWith("http") ? p.image : ""} onChange={(e) => set("image", e.target.value)} />
            </div>
          </div>

          <div className="adm-field"><label>Product name *</label>
            <input className="adm-input" value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Atlantic Salmon Fillet" /></div>

          <div className="adm-grid-2">
            <div className="adm-field"><label>Category *</label>
              <select className="adm-input" value={p.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Choose…</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            <div className="adm-field"><label>SKU</label>
              <input className="adm-input" value={p.sku} onChange={(e) => set("sku", e.target.value)} placeholder="DW-1001" /></div>
          </div>

          <div className="adm-grid-2">
            <div className="adm-field"><label>Pack / case size</label>
              <input className="adm-input" value={p.pack} onChange={(e) => set("pack", e.target.value)} placeholder="2 × 5 lb / case" /></div>
            <div className="adm-field"><label>Brand</label>
              <input className="adm-input" value={p.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Optional" /></div>
          </div>

          <div className="adm-grid-2">
            <div className="adm-field"><label>Origin</label>
              <input className="adm-input" value={p.origin} onChange={(e) => set("origin", e.target.value)} placeholder="e.g. Canada" /></div>
            <div className="adm-field"><label>Storage</label>
              <input className="adm-input" value={p.storage} onChange={(e) => set("storage", e.target.value)} placeholder="Keep frozen -18°C" /></div>
          </div>

          <div className="adm-field"><label>Tags <span className="adm-muted">(comma separated)</span></label>
            <input className="adm-input" value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="Wild, IQF, Shell-on" /></div>

          <div className="adm-field"><label>Short summary <span className="adm-muted">(shown on cards)</span></label>
            <input className="adm-input" value={p.short} onChange={(e) => set("short", e.target.value)} placeholder="One punchy line about the product" /></div>

          <div className="adm-field"><label>Full description</label>
            <textarea className="adm-input" rows={4} value={p.description} onChange={(e) => set("description", e.target.value)} placeholder="Longer details shown on the product page" /></div>

          <div className="adm-toggles">
            <label className="adm-toggle"><input type="checkbox" checked={p.featured} onChange={(e) => set("featured", e.target.checked)} /> <span>Featured / popular</span></label>
            <label className="adm-toggle"><input type="checkbox" checked={p.promo} onChange={(e) => set("promo", e.target.checked)} /> <span>Promo deal</span></label>
            <label className="adm-toggle"><input type="checkbox" checked={p.inStock} onChange={(e) => set("inStock", e.target.checked)} /> <span>In stock</span></label>
          </div>
        </div>
        <div className="adm-modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}><Icon name="check" size={17} /> Save product</button>
        </div>
      </div>
    </div>
  );
}

function downscale(dataUrl, maxW, quality) {
  const q = quality || 0.85;
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      if (img.width <= maxW) return res(dataUrl);
      const scale = maxW / img.width;
      const c = document.createElement("canvas");
      c.width = maxW; c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", q));
    };
    img.onerror = () => res(dataUrl);
    img.src = dataUrl;
  });
}

/* ---------------- Products tab ---------------- */
function AdminProducts() {
  const store = useStore();
  const products = store.getProducts();
  const cats = store.getCategories();
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const list = products.filter((p) => {
    if (filter !== "all" && p.category !== filter) return false;
    if (q.trim() && !p.name.toLowerCase().includes(q.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="adm-bar">
        <div className="adm-bar-left">
          <h2 className="adm-h2">Products <span className="adm-count">{products.length}</span></h2>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing(emptyProduct())}><Icon name="plus" size={17} /> Add product</button>
      </div>

      <div className="adm-filters">
        <div className="adm-search"><Icon name="search" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" /></div>
        <select className="adm-input adm-select-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All categories</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="adm-table">
        <div className="adm-thead">
          <span>Product</span><span>Category</span><span>Pack</span><span>Flags</span><span></span>
        </div>
        {list.map((p) => (
          <div className="adm-trow" key={p.id}>
            <div className="adm-tcell prod">
              <div className="adm-thumb"><Img src={p.image} label="—" rounded="8px" /></div>
              <div><div className="adm-pname">{p.name}</div><div className="adm-psku">{p.sku}</div></div>
            </div>
            <div className="adm-tcell"><span className="adm-pill">{DaisonStore.categoryName(p.category)}</span></div>
            <div className="adm-tcell adm-mono">{p.pack || "—"}</div>
            <div className="adm-tcell adm-flags">
              {p.featured && <span className="mini feat">Popular</span>}
              {p.promo && <span className="mini promo">Promo</span>}
              {p.inStock === false && <span className="mini oos">Out</span>}
            </div>
            <div className="adm-tcell adm-actions">
              <a className="adm-iconbtn" href={"#/product/" + p.id} target="_blank" title="View"><Icon name="arrow" size={16} /></a>
              <button className="adm-iconbtn" onClick={() => setEditing(p)} title="Edit"><Icon name="edit" size={16} /></button>
              <button className="adm-iconbtn danger" onClick={() => { if (confirm("Delete “" + p.name + "”?")) store.deleteProduct(p.id); }} title="Delete"><Icon name="trash" size={16} /></button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="adm-empty">No products match.</div>}
      </div>

      {editing && <ProductEditor initial={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

/* ---------------- Categories tab ---------------- */
function AdminCategories() {
  const store = useStore();
  const cats = store.getCategories();
  const products = store.getProducts();
  const [draft, setDraft] = useState({ name: "", blurb: "", image: "" });
  const [editId, setEditId] = useState(null);
  const [editDraft, setEditDraft] = useState({ name: "", blurb: "", image: "" });

  const add = () => {
    if (!draft.name.trim()) return;
    store.upsertCategory({ id: slugify(draft.name) || "cat-" + Date.now(), name: draft.name.trim(), blurb: draft.blurb.trim(), image: draft.image || "" });
    setDraft({ name: "", blurb: "", image: "" });
  };
  const countFor = (id) => products.filter((p) => p.category === id).length;

  const pickImage = async (e, apply) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      let url = await fileToDataUrl(f);
      url = await downscale(url, 1100);
      apply(url);
    } catch (err) { alert("Could not read image"); }
    e.target.value = "";
  };

  return (
    <div>
      <div className="adm-bar"><h2 className="adm-h2">Categories <span className="adm-count">{cats.length}</span></h2></div>
      <div className="adm-cat-add card">
        <div className="adm-grid-2" style={{ flex: 1 }}>
          <div className="adm-field"><label>New category name</label>
            <input className="adm-input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Beverages" /></div>
          <div className="adm-field"><label>Short blurb</label>
            <input className="adm-input" value={draft.blurb} onChange={(e) => setDraft({ ...draft, blurb: e.target.value })} placeholder="Shown under the category" /></div>
        </div>
        <button className="btn btn-primary" onClick={add} style={{ alignSelf: "flex-end" }}><Icon name="plus" size={17} /> Add</button>
      </div>

      <div className="adm-cat-list">
        {cats.map((c) => (
          <div className="adm-cat-item card" key={c.id}>
            {editId === c.id ? (
              <div className="adm-cat-editbox">
                <div className="adm-cat-img-edit">
                  <div className="adm-cat-thumb"><Img src={editDraft.image} label="no photo" rounded="10px" /></div>
                  <div className="adm-cat-img-actions">
                    <label className="btn btn-ghost btn-sm"><Icon name="upload" size={15} /> Upload photo
                      <input type="file" accept="image/*" hidden onChange={(e) => pickImage(e, (url) => setEditDraft((d) => ({ ...d, image: url })))} /></label>
                    {editDraft.image && <button className="btn btn-ghost btn-sm" onClick={() => setEditDraft({ ...editDraft, image: "" })}>Remove</button>}
                    <input className="adm-input" placeholder="…or paste image URL"
                      value={editDraft.image && editDraft.image.startsWith("http") ? editDraft.image : ""} onChange={(e) => setEditDraft({ ...editDraft, image: e.target.value })} />
                  </div>
                </div>
                <div className="adm-field"><label>Name</label>
                  <input className="adm-input" value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} /></div>
                <div className="adm-field"><label>Blurb</label>
                  <input className="adm-input" value={editDraft.blurb} onChange={(e) => setEditDraft({ ...editDraft, blurb: e.target.value })} /></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => { store.upsertCategory({ ...c, name: editDraft.name, blurb: editDraft.blurb, image: editDraft.image }); setEditId(null); }}><Icon name="check" size={15} /> Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="adm-cat-thumb sm"><Img src={c.image} label="—" rounded="10px" /></div>
                <div className="adm-cat-info">
                  <div className="adm-cat-name">{c.name} <span className="adm-cat-count">{countFor(c.id)} items</span></div>
                  <div className="adm-cat-blurb">{c.blurb || <em className="adm-muted">No blurb</em>}</div>
                </div>
                <div className="adm-actions">
                  <button className="adm-iconbtn" onClick={() => { setEditId(c.id); setEditDraft({ name: c.name, blurb: c.blurb || "", image: c.image || "" }); }}><Icon name="edit" size={16} /></button>
                  <button className="adm-iconbtn danger" onClick={() => {
                    if (countFor(c.id) > 0) { alert("Move or delete the " + countFor(c.id) + " product(s) in this category first."); return; }
                    if (confirm("Delete category “" + c.name + "”?")) store.deleteCategory(c.id);
                  }}><Icon name="trash" size={16} /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Site info tab ---------------- */
function AdminSettings({ serverMode }) {
  const store = useStore();
  const s = store.getSettings();
  const [draft, setDraft] = useState(s);
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => { setDraft({ ...draft, [k]: e.target.value }); setSaved(false); };
  const fields = [
    ["freeShip", "Announcement / free-shipping line"],
    ["phone", "Phone"],
    ["email", "Email"],
    ["address", "Address"],
    ["hours", "Operating hours"],
    ["mapQuery", "Map location (address the map & directions point to)"],
  ];
  return (
    <div>
      <div className="adm-bar"><h2 className="adm-h2">Site information</h2></div>
      <div className="card" style={{ padding: 24, maxWidth: 640 }}>
        {fields.map(([k, label]) => (
          <div className="adm-field" key={k}><label>{label}</label>
            <input className="adm-input" value={draft[k] || ""} onChange={set(k)} /></div>
        ))}
        <button className="btn btn-primary" onClick={() => { store.updateSettings(draft); setSaved(true); }}>
          <Icon name="check" size={17} /> Save changes
        </button>
        {saved && <span className="adm-saved"><Icon name="check" size={15} /> Saved</span>}
      </div>

      {!serverMode && <PasswordChanger store={store} />}
    </div>
  );
}

/* change the admin password (writes a SHA-256 hash into settings, publishes with catalogue.js) */
function PasswordChanger({ store }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState(null);
  const s = store.getSettings();
  const isCustom = s && /^[a-f0-9]{64}$/i.test(s.adminHash || "");

  const apply = async () => {
    if (pw.length < 6) { setMsg({ ok: false, t: "Use at least 6 characters." }); return; }
    if (pw !== pw2) { setMsg({ ok: false, t: "Passwords don’t match." }); return; }
    const hash = await sha256(pw);
    store.updateSettings({ adminHash: hash });
    setPw(""); setPw2("");
    setMsg({ ok: true, t: "Password updated. Publish (Data tab) and redeploy to apply it for everyone." });
  };

  return (
    <div className="card adm-pw-card" style={{ padding: 24, maxWidth: 640, marginTop: 18 }}>
      <h3 className="adm-pw-h3"><Icon name="shield" size={18} /> Admin password</h3>
      <p className="adm-pw-note">
        {isCustom
          ? "A custom password is set. Enter a new one below to change it."
          : "You’re using the default password (daison-admin). Set your own below."}
      </p>
      <div className="adm-field"><label>New password</label>
        <input className="adm-input" type="password" value={pw} autoComplete="new-password"
          onChange={(e) => { setPw(e.target.value); setMsg(null); }} /></div>
      <div className="adm-field"><label>Confirm new password</label>
        <input className="adm-input" type="password" value={pw2} autoComplete="new-password"
          onChange={(e) => { setPw2(e.target.value); setMsg(null); }} /></div>
      <button className="btn btn-primary" onClick={apply} disabled={!pw || !pw2}>
        <Icon name="check" size={17} /> Update password
      </button>
      {msg && <p className={"adm-import-msg " + (msg.ok ? "ok" : "bad")} style={{ marginTop: 12 }}>{msg.t}</p>}
      <p className="adm-pw-fine">Stored as a one-way hash, never in plain text. Because this is a static site, treat it as a front-door lock — it keeps the panel private, and the Publish step is what actually protects the live site.</p>
    </div>
  );
}

/* ---------------- Home page content tab ---------------- */
function ImgField({ label, value, fallbackNote, onChange }) {
  const pick = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try { let url = await fileToDataUrl(f); url = await downscale(url, 2000, 0.9); onChange(url); }
    catch (err) { alert("Could not read image"); }
    e.target.value = "";
  };
  return (
    <div className="adm-imgfield">
      <div className="adm-imgfield-prev"><Img src={value} label={fallbackNote || "no image"} rounded="10px" /></div>
      <div className="adm-imgfield-body">
        <label className="adm-imgfield-label">{label}</label>
        <div className="adm-imgfield-actions">
          <label className="btn btn-ghost btn-sm"><Icon name="upload" size={15} /> Upload
            <input type="file" accept="image/*" hidden onChange={pick} /></label>
          {value && <button className="btn btn-ghost btn-sm" onClick={() => onChange("")}>Use default</button>}
        </div>
        <input className="adm-input" placeholder="…or paste image URL"
          value={value && value.startsWith("http") ? value : ""} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

function AdminHome() {
  const store = useStore();
  const [h, setH] = useState(store.getHome());
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const icons = store.iconChoices();
  const set = (k, v) => { setH((x) => ({ ...x, [k]: v })); setSaveState("idle"); };
  const setTrust = (i, k, v) => { setH((x) => { const t = x.trust.map((it) => ({ ...it })); t[i][k] = v; return { ...x, trust: t }; }); setSaveState("idle"); };
  const save = async () => {
    store.updateHome(h);
    setSaveState("saving");
    const ok = await store.flush();
    setSaveState(ok ? "saved" : "error");
  };

  return (
    <div>
      <div className="adm-bar">
        <h2 className="adm-h2">Home page</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saveState === "saved" && <span className="adm-saved"><Icon name="check" size={15} /> Saved to cloud</span>}
          {saveState === "error" && <span className="adm-saveerr">Not saved — sign in on your main site URL, then retry</span>}
          <button className="btn btn-primary" onClick={save} disabled={saveState === "saving"}><Icon name="check" size={17} /> {saveState === "saving" ? "Saving…" : "Save home page"}</button>
        </div>
      </div>
      <p className="adm-users-note">Edit the words, photos and icons on your home page. Changes save when you press the button above.</p>

      <div className="card adm-home-sec">
        <h3 className="adm-home-h3">Hero (top of page)</h3>
        <div className="adm-field"><label>Small tag line</label>
          <input className="adm-input" value={h.heroTag} onChange={(e) => set("heroTag", e.target.value)} /></div>
        <div className="adm-field"><label>Headline</label>
          <textarea className="adm-input" rows={2} value={h.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} /></div>
        <div className="adm-field"><label>Sub-text</label>
          <textarea className="adm-input" rows={3} value={h.heroSub} onChange={(e) => set("heroSub", e.target.value)} /></div>
        <ImgField label="Hero photo" value={h.heroImgMain} fallbackNote="using default" onChange={(v) => set("heroImgMain", v)} />
      </div>

      <div className="card adm-home-sec">
        <h3 className="adm-home-h3">Highlights strip (4 items)</h3>
        {h.trust.map((t, i) => (
          <div className="adm-trust-row" key={i}>
            <div className="adm-trust-ic"><Icon name={t.ic} size={22} /></div>
            <div className="adm-field"><label>Icon</label>
              <select className="adm-input" value={t.ic} onChange={(e) => setTrust(i, "ic", e.target.value)}>
                {icons.map((n) => <option key={n} value={n}>{n}</option>)}
              </select></div>
            <div className="adm-field"><label>Title</label>
              <input className="adm-input" value={t.k} onChange={(e) => setTrust(i, "k", e.target.value)} /></div>
            <div className="adm-field"><label>Sub-text</label>
              <input className="adm-input" value={t.v} onChange={(e) => setTrust(i, "v", e.target.value)} /></div>
          </div>
        ))}
      </div>

      <div className="card adm-home-sec">
        <h3 className="adm-home-h3">Promo band</h3>
        <div className="adm-field"><label>Title</label>
          <input className="adm-input" value={h.promoTitle} onChange={(e) => set("promoTitle", e.target.value)} /></div>
        <div className="adm-field"><label>Text</label>
          <textarea className="adm-input" rows={3} value={h.promoText} onChange={(e) => set("promoText", e.target.value)} /></div>
        <ImgField label="Banner image (best at 1200×630 — shown whole, not cropped)" value={h.promoBanner} fallbackNote="using default" onChange={(v) => set("promoBanner", v)} />
      </div>

      <div className="card adm-home-sec">
        <h3 className="adm-home-h3">About teaser</h3>
        <div className="adm-field"><label>Title</label>
          <input className="adm-input" value={h.aboutTitle} onChange={(e) => set("aboutTitle", e.target.value)} /></div>
        <div className="adm-field"><label>Text</label>
          <textarea className="adm-input" rows={4} value={h.aboutText} onChange={(e) => set("aboutText", e.target.value)} /></div>
        <div className="adm-grid-2">
          <div className="adm-field"><label>Stat number</label>
            <input className="adm-input" value={h.aboutStatN} onChange={(e) => set("aboutStatN", e.target.value)} /></div>
          <div className="adm-field"><label>Stat label</label>
            <input className="adm-input" value={h.aboutStatL} onChange={(e) => set("aboutStatL", e.target.value)} /></div>
        </div>
        <ImgField label="About image" value={h.aboutImg} fallbackNote="using default" onChange={(v) => set("aboutImg", v)} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 6 }}>
        {saveState === "saved" && <span className="adm-saved"><Icon name="check" size={15} /> Saved to cloud</span>}
        {saveState === "error" && <span className="adm-saveerr">Not saved — sign in on your main site URL, then retry</span>}
        <button className="btn btn-primary btn-lg" onClick={save} disabled={saveState === "saving"}><Icon name="check" size={18} /> {saveState === "saving" ? "Saving…" : "Save home page"}</button>
      </div>
    </div>
  );
}

/* ---------------- Data tab ---------------- */
function AdminData({ serverMode }) {
  const store = useStore();
  const [importMsg, setImportMsg] = useState(null);
  const draft = !serverMode && store.isDraft();

  const download = (text, filename, type) => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  const doPublish = () => download(store.exportPublishJS(), "catalogue.js", "application/javascript");
  const doExport = () => download(store.exportJSON(), "daison-catalogue.json", "application/json");
  const doImport = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try { store.importJSON(await f.text()); setImportMsg({ ok: true, t: "Catalogue imported successfully." }); }
    catch (err) { setImportMsg({ ok: false, t: "Import failed: " + err.message }); }
    e.target.value = "";
  };

  return (
    <div>
      <div className="adm-bar"><h2 className="adm-h2">{serverMode ? "Cloud & backup" : "Publish & backup"}</h2></div>

      {serverMode ? (
        <div className="adm-publish card">
          <div className="adm-publish-ic" style={{ background: "var(--green-700)", color: "#fdfcf6" }}><Icon name="cloud" size={26} /></div>
          <div className="adm-publish-body">
            <h3>Changes save automatically</h3>
            <p>This site is connected to your database. Every edit in Products, Categories, Site info and Users is saved to the cloud and is <b>live instantly</b> for all visitors — no download or redeploy needed.</p>
            <div className="adm-publish-actions">
              <button className="btn btn-ghost" onClick={doExport}><Icon name="download" size={17} /> Download JSON backup</button>
            </div>
          </div>
        </div>
      ) : (
        <div className={"adm-publish card" + (draft ? " has-draft" : "")}>
          <div className="adm-publish-ic"><Icon name="upload" size={26} /></div>
          <div className="adm-publish-body">
            <h3>Publish your changes to the live site</h3>
            <p>
              {draft
                ? "You have unpublished edits saved in this browser. Publish to push them live for everyone."
                : "Your catalogue matches what’s live. Make edits in Products / Categories / Site info, then come back here to publish."}
            </p>
            <ol className="adm-steps">
              <li><b>Download</b> the publish file below (<span className="adm-mono">catalogue.js</span>).</li>
              <li><b>Replace</b> the old <span className="adm-mono">catalogue.js</span> in your site folder with it.</li>
              <li><b>Redeploy</b> — drag the folder onto Vercel, or push to your git repo. Live in ~30s.</li>
            </ol>
            <div className="adm-publish-actions">
              <button className="btn btn-primary btn-lg" onClick={doPublish}><Icon name="download" size={18} /> Publish (download catalogue.js)</button>
              {draft && <button className="btn btn-ghost" onClick={() => { if (confirm("Discard your local edits and revert to what’s currently live?")) store.discardDraft(); }}>Discard local edits</button>}
            </div>
            {draft && <div className="adm-draft-tag"><span className="dot" /> Unpublished changes</div>}
          </div>
        </div>
      )}

      <div className="adm-data-grid">
        <div className="card adm-data-card">
          <div className="adm-data-ic"><Icon name="download" size={22} /></div>
          <h3>Export backup (JSON)</h3>
          <p>Download a plain JSON copy of everything — keep it as a backup or hand it to a developer.</p>
          <button className="btn btn-ghost" onClick={doExport}><Icon name="download" size={17} /> Download JSON</button>
        </div>
        <div className="card adm-data-card">
          <div className="adm-data-ic"><Icon name="upload" size={22} /></div>
          <h3>Import catalogue</h3>
          <p>{serverMode
            ? "Load a previously exported JSON file. It replaces the catalogue and saves to the cloud."
            : "Load a previously exported JSON file. This becomes a new draft in this browser — publish it to go live."}</p>
          <label className="btn btn-ghost"><Icon name="upload" size={17} /> Choose file<input type="file" accept="application/json,.json" onChange={doImport} hidden /></label>
          {importMsg && <p className={"adm-import-msg " + (importMsg.ok ? "ok" : "bad")}>{importMsg.t}</p>}
        </div>
        {!serverMode && (
          <div className="card adm-data-card">
            <div className="adm-data-ic warn"><Icon name="trash" size={22} /></div>
            <h3>Revert to live</h3>
            <p>Discard your local edits in this browser and reload the currently published catalogue.</p>
            <button className="btn btn-ghost" onClick={() => { if (confirm("Discard local edits and revert to the live catalogue?")) store.discardDraft(); }}>Revert to live</button>
          </div>
        )}
      </div>

      <div className="adm-note card">
        <Icon name="shield" size={20} />
        <div>
          {serverMode ? (
            <><strong>How it works.</strong> Logins are verified on the server and the catalogue lives in your Neon database, so changes are live the moment you make them and your team signs in with their own accounts. Keep an occasional JSON backup for peace of mind.</>
          ) : (
            <><strong>How it works.</strong> Edits (including uploaded images) are saved in <em>this browser</em> so you can work instantly with no login. They go live for everyone only when you <b>Publish</b> the <span className="adm-mono">catalogue.js</span> file and redeploy. Want edits to go live <em>instantly</em> with no redeploy? Connect the Vercel + Neon backend — see <span className="adm-mono">BACKEND-SETUP.md</span>.</>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Admin shell ---------------- */
function AdminPage({ onLogout, currentUser, serverMode }) {
  const store = useStore();
  const [tab, setTab] = useState("products");
  const draft = !serverMode && store.isDraft();
  const tabs = [
    ["products", "Products", "grid"],
    ["categories", "Categories", "list"],
    ["home", "Home page", "edit"],
    ["settings", "Site info", "edit"],
  ];
  if (serverMode) tabs.push(["users", "Users", "users"]);
  tabs.push(["data", serverMode ? "Backup" : "Publish", "doc"]);

  return (
    <main className="adm">
      <div className="adm-header">
        <div className="wrap adm-header-row">
          <div>
            <div className="eyebrow" style={{ color: "var(--gold-soft)" }}>Catalogue manager</div>
            <h1 className="adm-title">Admin</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {serverMode && <SyncStatus store={store} />}
            {draft && (
              <button className="adm-publish-cta" onClick={() => setTab("data")}>
                <span className="dot" /> Unpublished changes
              </button>
            )}
            {currentUser && <span className="adm-whoami">{currentUser.name || currentUser.email}</span>}
            <a href="#/" className="btn btn-ghost-light btn-sm"><Icon name="arrowLeft" size={16} /> View site</a>
            {onLogout && <button className="btn btn-ghost-light btn-sm" onClick={onLogout}><Icon name="shield" size={15} /> Sign out</button>}
          </div>
        </div>
      </div>
      {serverMode && store.serverEmpty() && <InitBanner store={store} />}
      <div className="wrap adm-wrap">
        <nav className="adm-tabs">
          {tabs.map(([id, label, ic]) => (
            <button key={id} className={"adm-tab" + (tab === id ? " on" : "")} onClick={() => setTab(id)}>
              <Icon name={ic} size={17} /> {label}
            </button>
          ))}
        </nav>
        <div className="adm-content">
          {tab === "products" && <AdminProducts />}
          {tab === "categories" && <AdminCategories />}
          {tab === "home" && <AdminHome />}
          {tab === "settings" && <AdminSettings serverMode={serverMode} />}
          {tab === "users" && <AdminUsers currentUser={currentUser} />}
          {tab === "data" && <AdminData serverMode={serverMode} />}
        </div>
      </div>
    </main>
  );
}

/* cloud sync indicator (server mode) */
function SyncStatus({ store }) {
  const s = store.syncStatus();
  const map = {
    idle: ["", ""], saving: ["Saving…", "saving"], saved: ["Saved to cloud", "saved"],
    error: ["Sync failed — retry", "error"], auth: ["Session expired", "error"],
  };
  const [label, cls] = map[s] || ["", ""];
  if (!label) return null;
  return (
    <button className={"adm-sync " + cls} onClick={() => (s === "error" ? store.retrySync() : null)} title="Changes save automatically">
      <Icon name={cls === "saved" ? "check" : "cloud"} size={15} /> {label}
    </button>
  );
}

/* shown when the database is reachable but has no catalogue yet */
function InitBanner({ store }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  if (done) return null;
  const go = async () => {
    setBusy(true);
    await store.initFromSeed();
    setBusy(false); setDone(true);
  };
  return (
    <div className="adm-initbar">
      <div className="wrap adm-initbar-row">
        <Icon name="cloud" size={18} />
        <span>Your database is connected but empty. Load the current starter catalogue into it to go live.</span>
        <button className="btn btn-gold btn-sm" onClick={go} disabled={busy}>{busy ? "Loading…" : "Initialise catalogue"}</button>
      </div>
    </div>
  );
}

Object.assign(window, { AdminPage });

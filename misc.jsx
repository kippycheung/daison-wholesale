/* ===========================================================
   DAISON WHOLESALE — Contact / Get-a-Quote + About
   =========================================================== */

/* Shared submit: try real email (server), else open the mail app. */
async function submitQuoteRequest(form, items, s) {
  const payload = {
    name: form.name, business: form.business, email: form.email, phone: form.phone,
    message: form.message,
    items: items.map((it) => ({ qty: it.qty, name: it.name, pack: it.pack || "" })),
  };
  const res = await DaisonStore.sendQuote(payload);
  if (res.ok) return { ok: true, method: "email" };
  const quoteSummary = items.length
    ? "\n\nQuote list:\n" + items.map((it) => `• ${it.qty} × ${it.name}${it.pack ? " (" + it.pack + ")" : ""}`).join("\n")
    : "";
  const subject = `Quote request — ${form.business || form.name}`;
  const body = `Name: ${form.name}\nBusiness: ${form.business}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}${quoteSummary}`;
  window.location.href = `mailto:${s.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { ok: true, method: "mailto" };
}

function ContactPage({ route }) {
  const s = DaisonStore.getSettings();
  const { items, clear } = useQuote();
  const query = parseQuery(route);
  const fromQuote = query.from === "quote";
  const singleItem = query.item ? decodeURIComponent(query.item) : "";

  const [form, setForm] = useState({
    name: "", business: "", email: "", phone: "",
    message: singleItem ? `I'd like a quote on: ${singleItem}\n\n` : "",
  });
  const [sent, setSent] = useState(null);   // null | "email" | "mailto"
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.message.trim() && !items.length) e.message = "Tell us what you need";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const res = await submitQuoteRequest(form, items, s);
    setBusy(false);
    setSent(res.method);
  };

  const mapSrc = "https://www.google.com/maps?q=" + encodeURIComponent(s.mapQuery || s.address) + "&output=embed";

  if (sent) {
    return (
      <main className="wrap contact-sent">
        <div className="sent-card card">
          <div className="sent-ic"><Icon name="check" size={34} /></div>
          <h1>{sent === "email" ? "Request sent — thank you!" : "Your request is ready to send"}</h1>
          <p>{sent === "email"
            ? "We’ve received your request and will reply with pricing and availability, usually the same business day."
            : "We’ve opened your email app with everything filled in — just hit send and we’ll reply with pricing and availability."}</p>
          <p className="muted" style={{ fontSize: 14 }}>Prefer to reach us directly? Email <a href={"mailto:" + s.email} style={{ color: "var(--green-700)", fontWeight: 700 }}>{s.email}</a> or call {s.phone}.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
            <a href="#/catalogue" className="btn btn-primary">Back to catalogue</a>
            <button className="btn btn-ghost" onClick={() => { clear(); setSent(null); setForm({ name: "", business: "", email: "", phone: "", message: "" }); }}>Start a new request</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="cat-hero">
        <div className="wrap">
          <nav className="crumbs"><a href="#/">Home</a> <Icon name="chevRight" size={13} /> <span>Contact</span></nav>
          <h1 className="cat-h1">Get a quote</h1>
          <p className="cat-lede">No online checkout — and that’s on purpose. Tell us what you need and we’ll send back real wholesale pricing, pack sizes and availability.</p>
        </div>
      </div>

      <div className="wrap contact-layout">
        <form className="contact-form card" onSubmit={submit} noValidate>
          {fromQuote && items.length > 0 && (
            <div className="quote-recap">
              <div className="quote-recap-head">
                <span className="eyebrow">Your quote list · {items.reduce((n, x) => n + x.qty, 0)} items</span>
              </div>
              <ul>
                {items.map((it) => (
                  <li key={it.id}><span className="qr-qty">{it.qty}×</span> {it.name} {it.pack && <span className="qr-pack">{it.pack}</span>}</li>
                ))}
              </ul>
              <p className="qr-note">These items will be included with your message automatically.</p>
            </div>
          )}

          <div className="form-grid">
            <label className="field">
              <span>Your name *</span>
              <input value={form.name} onChange={set("name")} className={errs.name ? "err" : ""} placeholder="Jane Smith" />
              {errs.name && <em>{errs.name}</em>}
            </label>
            <label className="field">
              <span>Business name</span>
              <input value={form.business} onChange={set("business")} placeholder="Restaurant / store name" />
            </label>
            <label className="field">
              <span>Email *</span>
              <input value={form.email} onChange={set("email")} className={errs.email ? "err" : ""} placeholder="you@business.com" />
              {errs.email && <em>{errs.email}</em>}
            </label>
            <label className="field">
              <span>Phone</span>
              <input value={form.phone} onChange={set("phone")} placeholder="(587) 000-0000" />
            </label>
          </div>
          <label className="field">
            <span>What do you need? {!items.length && "*"}</span>
            <textarea rows={items.length ? 4 : 6} value={form.message} onChange={set("message")} className={errs.message ? "err" : ""}
              placeholder="List items, quantities, delivery area, and how often you'll reorder…" />
            {errs.message && <em>{errs.message}</em>}
          </label>
          <button className="btn btn-gold btn-lg" type="submit" disabled={busy} style={{ justifyContent: "center" }}>
            <Icon name="mail" size={18} /> {busy ? "Sending…" : "Send quote request"}
          </button>
          <p className="form-foot">By sending, you agree to be contacted about your request. We never take payment online.</p>
        </form>

        <aside className="contact-aside">
          <div className="contact-info card">
            <h3>Reach us directly</h3>
            <a className="ci-row" href={"tel:" + s.phone}><span className="ci-ic"><Icon name="phone" size={18} /></span><div><div className="ci-k">Call</div><div className="ci-v">{s.phone}</div></div></a>
            <a className="ci-row" href={"mailto:" + s.email}><span className="ci-ic"><Icon name="mail" size={18} /></span><div><div className="ci-k">Email</div><div className="ci-v">{s.email}</div></div></a>
            <div className="ci-row"><span className="ci-ic"><Icon name="pin" size={18} /></span><div><div className="ci-k">Visit</div><div className="ci-v">{s.address}</div></div></div>
            <div className="ci-row"><span className="ci-ic"><Icon name="clock" size={18} /></span><div><div className="ci-k">Hours</div><div className="ci-v">{s.hours}</div></div></div>
            <a className="btn btn-ghost btn-sm" style={{ justifyContent: "center", marginTop: 4 }}
               href={"https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(s.mapQuery || s.address)} target="_blank" rel="noreferrer">
              Get directions <Icon name="arrow" size={16} />
            </a>
          </div>
          <div className="contact-map">
            <iframe title="Daison Wholesale location" src={mapSrc} loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" allowFullScreen
              style={{ border: 0, width: "100%", height: "100%", display: "block" }}></iframe>
          </div>
        </aside>
      </div>
    </main>
  );
}

/* ---------------- About ---------------- */
function AboutPage() {
  const s = DaisonStore.getSettings();
  const stats = [
    ["4", "Product categories"],
    ["1", "Combined delivery"],
    ["$250", "Free Calgary delivery over"],
  ];
  const values = [
    ["box", "Packaging specialists", "Takeout containers, bowls, cups and cutlery in case quantities — with custom logo printing available on request."],
    ["snow", "Cold-chain first", "Frozen goods stay at −18°C from our facility to your kitchen, so quality never slips in transit."],
    ["box", "Built for volume", "Case quantities and standing orders priced for restaurants, grocers and food businesses."],
    ["shield", "A partner you can reach", "Real people, local to Calgary, who answer the phone and stand behind every order."],
  ];
  return (
    <main>
      <section className="about-hero">
        <div className="wrap about-hero-grid">
          <div>
            <div className="eyebrow">Our story</div>
            <h1 className="about-hero-h1">Calgary’s wholesale packaging &amp; food partner.</h1>
            <p>Daison Wholesale focuses on takeout and foodservice packaging — containers, bowls, cups and cutlery — alongside a tight range of flash-frozen foods, dry goods and everyday essentials. We also print your logo on custom packaging. We’ve built Daison into a supplier that Calgary kitchens rely on.</p>
          </div>
          <div className="about-hero-media"><Img src={window.__resources.storefront} label="our Calgary store" /></div>
        </div>
      </section>

      <div className="wrap about-stats">
        {stats.map(([n, l]) => (
          <div className="about-stat-card" key={l}><div className="asc-n">{n}</div><div className="asc-l">{l}</div></div>
        ))}
      </div>

      <section className="wrap sec">
        <SectionHead eyebrow="Why buyers choose us" title="What we stand for" />
        <div className="values-grid">
          {values.map(([ic, k, v]) => (
            <div className="value-card" key={k}>
              <div className="value-ic"><Icon name={ic} size={22} /></div>
              <h3>{k}</h3>
              <p>{v}</p>
            </div>
          ))}
        </div>
      </section>

      <QuoteCTA />
    </main>
  );
}

Object.assign(window, { ContactPage, AboutPage, submitQuoteRequest });

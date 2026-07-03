/* ===========================================================
   DAISON WHOLESALE — layout: Header, Footer, QuoteDrawer
   =========================================================== */

function Announce() {
  const s = DaisonStore.getSettings();
  return (
    <div className="announce">
      <div className="wrap announce-row">
        <span><Icon name="truck" size={15} /> {s.freeShip}</span>
        <span className="announce-sep" />
        <span><Icon name="phone" size={14} /> {s.phone}</span>
      </div>
    </div>
  );
}

function Header() {
  const route = useHashRoute();
  const { count, setOpen } = useQuote();
  const store = useStore();
  const cats = store.getCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => { setMenuOpen(false); setCatOpen(false); }, [route]);

  const isActive = (p) => route === p || (p !== "/" && route.startsWith(p));
  const submitSearch = (e) => { e.preventDefault(); navigate("/catalogue?q=" + encodeURIComponent(q)); };

  return (
    <>
      <Announce />
      <header className="hdr">
        <div className="wrap hdr-row">
          <Logo />
          <nav className="hdr-nav">
            <a href="#/" className={isActive("/") && route === "/" ? "navlink on" : "navlink"}>Home</a>
            <div className="navlink-wrap"
                 onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <a href="#/catalogue" className={isActive("/catalogue") ? "navlink on" : "navlink"}>
                Catalogue <Icon name="chevDown" size={15} />
              </a>
              {catOpen && (
                <div className="cat-pop">
                  <a href="#/catalogue" className="cat-pop-item all">All products</a>
                  {cats.map((c) => (
                    <a key={c.id} href={"#/catalogue?cat=" + c.id} className="cat-pop-item">
                      <span>{c.name}</span>
                      <span className="cat-pop-blurb">{c.blurb}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <a href="#/about" className={isActive("/about") ? "navlink on" : "navlink"}>About</a>
            <a href="#/contact" className={isActive("/contact") ? "navlink on" : "navlink"}>Contact</a>
          </nav>

          <div className="hdr-actions">
            <form className="hdr-search" onSubmit={submitSearch}>
              <Icon name="search" size={17} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" />
            </form>
            <button className="quote-btn" onClick={() => setOpen(true)}>
              <Icon name="doc" size={18} />
              <span>Quote</span>
              {count > 0 && <span className="quote-count">{count}</span>}
            </button>
            <button className="hamb" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
              <Icon name={menuOpen ? "close" : "menu"} size={22} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            <form className="hdr-search mobile" onSubmit={submitSearch}>
              <Icon name="search" size={17} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" />
            </form>
            <a href="#/" className="m-link">Home</a>
            <a href="#/catalogue" className="m-link">All Products</a>
            {cats.map((c) => (
              <a key={c.id} href={"#/catalogue?cat=" + c.id} className="m-link sub">{c.name}</a>
            ))}
            <a href="#/about" className="m-link">About</a>
            <a href="#/contact" className="m-link">Contact</a>
          </div>
        )}
      </header>
    </>
  );
}

function Footer() {
  const s = DaisonStore.getSettings();
  const store = useStore();
  const cats = store.getCategories();
  return (
    <footer className="ftr">
      <div className="wrap ftr-grid">
        <div className="ftr-brand">
          <Logo light />
          <p className="ftr-tag">Calgary’s wholesale source for takeout packaging, frozen foods, dry goods and restaurant supplies — with custom-branded packaging on request.</p>
          <div className="ftr-social">
            <a href="https://www.facebook.com/daisonws" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://www.instagram.com/daisonwholesale/" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
        <div className="ftr-col">
          <h4>Shop</h4>
          <a href="#/catalogue">All products</a>
          {cats.slice(0, 5).map((c) => <a key={c.id} href={"#/catalogue?cat=" + c.id}>{c.name}</a>)}
        </div>
        <div className="ftr-col">
          <h4>Company</h4>
          <a href="#/about">About us</a>
          <a href="#/contact">Contact</a>
          <a href="#/contact">Request a quote</a>
          <a href="#/admin">Admin</a>
        </div>
        <div className="ftr-col">
          <h4>Visit / Contact</h4>
          <p className="ftr-line"><Icon name="pin" size={15} /> {s.address}</p>
          <p className="ftr-line"><Icon name="clock" size={15} /> {s.hours}</p>
          <p className="ftr-line"><Icon name="phone" size={15} /> <a href={"tel:" + s.phone}>{s.phone}</a></p>
          <p className="ftr-line"><Icon name="mail" size={15} /> <a href={"mailto:" + s.email}>{s.email}</a></p>
        </div>
      </div>
      <div className="ftr-bottom">
        <div className="wrap ftr-bottom-row">
          <span>© {new Date().getFullYear()} Daison Wholesale. All rights reserved.</span>
          <span className="muted-light">Wholesale & foodservice supply · Calgary, AB</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Quote drawer ---------- */
function QuoteDrawer() {
  const { items, setQty, remove, clear, open, setOpen, count } = useQuote();
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <div className="drawer-scrim" onClick={() => setOpen(false)}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <div className="eyebrow">Your request</div>
            <h3 style={{ fontSize: 22 }}>Quote list {count > 0 && <span className="muted">· {count} item{count !== 1 ? "s" : ""}</span>}</h3>
          </div>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close"><Icon name="close" /></button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <Icon name="doc" size={34} />
            <p>Your quote list is empty.</p>
            <span className="muted">Browse the catalogue and add the items you need — then send us one request for pricing.</span>
            <a href="#/catalogue" className="btn btn-primary" onClick={() => setOpen(false)} style={{ marginTop: 8 }}>
              Browse catalogue <Icon name="arrow" size={17} />
            </a>
          </div>
        ) : (
          <>
            <div className="drawer-list scroll-y">
              {items.map((it) => (
                <div className="q-row" key={it.id}>
                  <div className="q-thumb"><Img src={it.image} label="photo" rounded="10px" /></div>
                  <div className="q-info">
                    <a href={"#/product/" + it.id} className="q-name" onClick={() => setOpen(false)}>{it.name}</a>
                    {it.pack && <div className="q-pack">{it.pack}</div>}
                    <div className="qty">
                      <button onClick={() => setQty(it.id, it.qty - 1)} aria-label="Decrease"><Icon name="minus" size={15} /></button>
                      <input value={it.qty} onChange={(e) => setQty(it.id, parseInt(e.target.value) || 1)} />
                      <button onClick={() => setQty(it.id, it.qty + 1)} aria-label="Increase"><Icon name="plus" size={15} /></button>
                      <span className="qty-unit">cases</span>
                    </div>
                  </div>
                  <button className="q-del" onClick={() => remove(it.id)} aria-label="Remove"><Icon name="trash" size={17} /></button>
                </div>
              ))}
            </div>
            <div className="drawer-foot">
              <button className="btn btn-ghost btn-sm" onClick={clear}>Clear all</button>
              <a href="#/contact?from=quote" className="btn btn-gold" onClick={() => setOpen(false)}>
                Request quote <Icon name="arrow" size={17} />
              </a>
            </div>
            <p className="drawer-note">No payment is taken online. We’ll reply with pricing & availability by email.</p>
          </>
        )}
      </aside>
    </div>
  );
}

Object.assign(window, { Header, Footer, QuoteDrawer });

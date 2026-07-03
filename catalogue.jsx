/* ===========================================================
   DAISON WHOLESALE — Catalogue (listing + filters + search)
   =========================================================== */

function parseQuery(route) {
  const qi = route.indexOf("?");
  const out = {};
  if (qi >= 0) {
    new URLSearchParams(route.slice(qi + 1)).forEach((v, k) => { out[k] = v; });
  }
  return out;
}

function CataloguePage({ route }) {
  const store = useStore();
  const all = store.getProducts();
  const cats = store.getCategories();
  const query = parseQuery(route);

  const [activeCat, setActiveCat] = useState(query.cat || "all");
  const [q, setQ] = useState(query.q || "");
  const [sort, setSort] = useState("featured");
  const [onlyStock, setOnlyStock] = useState(false);

  useEffect(() => { setActiveCat(query.cat || "all"); setQ(query.q || ""); }, [route]);

  let list = all.filter((p) => {
    if (activeCat !== "all" && p.category !== activeCat) return false;
    if (onlyStock && p.inStock === false) return false;
    if (q.trim()) {
      const hay = (p.name + " " + p.short + " " + p.brand + " " + (p.tags || []).join(" ") + " " + DaisonStore.categoryName(p.category)).toLowerCase();
      if (!hay.includes(q.trim().toLowerCase())) return false;
    }
    return true;
  });

  list = [...list].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    return 0;
  });

  const countFor = (id) => all.filter((p) => p.category === id).length;
  const setCat = (id) => { setActiveCat(id); window.location.hash = "/catalogue" + (id === "all" ? "" : "?cat=" + id); };

  return (
    <main className="cat-page">
      <div className="cat-hero">
        <div className="wrap">
          <nav className="crumbs"><a href="#/">Home</a> <Icon name="chevRight" size={13} /> <span>Catalogue</span></nav>
          <h1 className="cat-h1">{activeCat === "all" ? "Full catalogue" : DaisonStore.categoryName(activeCat)}</h1>
          <p className="cat-lede">
            {activeCat === "all"
              ? "Everything we stock — takeout packaging, frozen foods, dry goods and everyday supplies. Add items to your quote list for pricing."
              : (cats.find((c) => c.id === activeCat)?.blurb || "")}
          </p>
        </div>
      </div>

      <div className="wrap cat-layout">
        <aside className="cat-side">
          <div className="filter-block">
            <div className="filter-title">Categories</div>
            <button className={"filter-cat" + (activeCat === "all" ? " on" : "")} onClick={() => setCat("all")}>
              <span>All products</span><span className="fc-count">{all.length}</span>
            </button>
            {cats.map((c) => (
              <button key={c.id} className={"filter-cat" + (activeCat === c.id ? " on" : "")} onClick={() => setCat(c.id)}>
                <span>{c.name}</span><span className="fc-count">{countFor(c.id)}</span>
              </button>
            ))}
          </div>
          <div className="filter-block">
            <div className="filter-title">Availability</div>
            <label className="filter-check">
              <input type="checkbox" checked={onlyStock} onChange={(e) => setOnlyStock(e.target.checked)} />
              <span>In-stock items only</span>
            </label>
          </div>
          <div className="side-cta">
            <div className="side-cta-ic"><Icon name="doc" size={20} /></div>
            <h4>Need a custom quote?</h4>
            <p>Tell us what you need and the volume — we’ll get you pricing fast.</p>
            <a href="#/contact" className="btn btn-primary btn-sm" style={{ justifyContent: "center" }}>Contact us</a>
          </div>
        </aside>

        <section className="cat-main">
          <div className="cat-toolbar">
            <form className="cat-search" onSubmit={(e) => e.preventDefault()}>
              <Icon name="search" size={18} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search this catalogue…" />
              {q && <button type="button" className="cat-search-clear" onClick={() => setQ("")}><Icon name="close" size={16} /></button>}
            </form>
            <div className="cat-toolbar-right">
              <span className="cat-results">{list.length} item{list.length !== 1 ? "s" : ""}</span>
              <label className="cat-sort">
                Sort
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="featured">Popular first</option>
                  <option value="name">Name A–Z</option>
                </select>
              </label>
            </div>
          </div>

          {list.length === 0 ? (
            <div className="cat-empty">
              <Icon name="search" size={32} />
              <p>No products match.</p>
              <span className="muted">Try a different category or clear your search.</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { setQ(""); setCat("all"); setOnlyStock(false); }}>Reset filters</button>
            </div>
          ) : (
            <div className="pgrid">
              {list.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

Object.assign(window, { CataloguePage, parseQuery });

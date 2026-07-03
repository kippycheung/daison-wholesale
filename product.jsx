/* ===========================================================
   DAISON WHOLESALE — Product detail (dynamic)
   =========================================================== */

function ProductPage({ id }) {
  const store = useStore();
  const { add, setOpen } = useQuote();
  const p = store.getProduct(id);
  const [qty, setQty] = useState(1);

  useEffect(() => { setQty(1); }, [id]);

  if (!p) {
    return (
      <main className="wrap notfound">
        <h1>Product not found</h1>
        <p className="muted">This item may have been removed from the catalogue.</p>
        <a href="#/catalogue" className="btn btn-primary">Back to catalogue <Icon name="arrow" size={17} /></a>
      </main>
    );
  }

  const catName = DaisonStore.categoryName(p.category);
  const related = store.getProducts().filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);

  const specs = [
    ["Category", catName],
    ["Pack size", p.pack],
    ["SKU", p.sku],
    ["Brand", p.brand],
    ["Origin", p.origin],
    ["Storage", p.storage],
  ].filter(([, v]) => v);

  const addAndOpen = () => { add(p, qty); setTimeout(() => setOpen(true), 300); };

  return (
    <main>
      <div className="wrap" style={{ paddingTop: 22 }}>
        <nav className="crumbs">
          <a href="#/">Home</a> <Icon name="chevRight" size={13} />
          <a href="#/catalogue">Catalogue</a> <Icon name="chevRight" size={13} />
          <a href={"#/catalogue?cat=" + p.category}>{catName}</a> <Icon name="chevRight" size={13} />
          <span>{p.name}</span>
        </nav>
      </div>

      <section className="wrap pdp">
        <div className="pdp-gallery">
          <div className="pdp-main">
            <Img src={p.image} alt={p.name} label="product photo" />
            <div className="pdp-badges">
              {p.promo && <span className="badge promo">Featured deal</span>}
              {p.inStock === false && <span className="badge oos">By request</span>}
            </div>
          </div>
          <div className="pdp-thumbs">
            {[0, 1, 2].map((i) => (
              <div className="pdp-thumb" key={i}><Img src={i === 0 ? p.image : ""} label={"view " + (i + 1)} /></div>
            ))}
          </div>
        </div>

        <div className="pdp-info">
          <div className="pdp-cat">{catName}</div>
          <h1 className="pdp-name">{p.name}</h1>
          {p.tags && p.tags.length > 0 && (
            <div className="pdp-tags">{p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
          )}
          {p.short && <p className="pdp-short">{p.short}</p>}

          <div className="pdp-pricecard">
            <div className="pdp-price-row">
              <div>
                <div className="pdp-price-k">Pricing</div>
                <div className="pdp-price-v">Quote on request</div>
              </div>
              <span className={"pdp-stock" + (p.inStock === false ? " out" : "")}>
                <span className="dot" /> {p.inStock === false ? "Available by request" : "In stock"}
              </span>
            </div>
            {p.pack && <div className="pdp-packline"><Icon name="box" size={16} /> Sold by: <strong>{p.pack}</strong></div>}

            <div className="pdp-buy">
              <div className="qty pdp-qty">
                <button onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="Decrease"><Icon name="minus" size={16} /></button>
                <input value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
                <button onClick={() => setQty((n) => n + 1)} aria-label="Increase"><Icon name="plus" size={16} /></button>
                <span className="qty-unit">cases</span>
              </div>
              <button className="btn btn-gold btn-lg pdp-add" onClick={addAndOpen}>
                <Icon name="doc" size={18} /> Add to quote
              </button>
            </div>
            <a href={"#/contact?item=" + encodeURIComponent(p.name)} className="pdp-quicklink">
              <Icon name="mail" size={16} /> Or ask about this item directly
            </a>
          </div>

          {p.description && (
            <div className="pdp-desc">
              <h3>Description</h3>
              <p>{p.description}</p>
            </div>
          )}

          {specs.length > 0 && (
            <div className="pdp-specs">
              <h3>Product details</h3>
              <dl>
                {specs.map(([k, v]) => (
                  <div className="spec-row" key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="wrap sec" style={{ paddingTop: 24 }}>
          <SectionHead eyebrow="More in this category" title={"More " + catName}
            link={"#/catalogue?cat=" + p.category} linkText="View all" />
          <div className="pgrid">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </main>
  );
}

Object.assign(window, { ProductPage });

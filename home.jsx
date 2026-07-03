/* ===========================================================
   DAISON WHOLESALE — Home page
   =========================================================== */

function HomeHero() {
  const s = DaisonStore.getSettings();
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="tag"><Icon name="pin" size={13} /> Calgary, Alberta</div>
          <h1 className="hero-h1">Wholesale packaging, frozen &amp; dry foods — <span className="hl">delivered across Calgary.</span></h1>
          <p className="hero-sub">Daison Wholesale supplies restaurants, grocers and foodservice with takeout packaging, flash-frozen foods, dry goods and everyday essentials — at true wholesale volume. Custom-branded packaging available on request.</p>
          <div className="hero-cta">
            <a href="#/catalogue" className="btn btn-primary btn-lg">Browse catalogue <Icon name="arrow" size={18} /></a>
            <a href="#/contact" className="btn btn-ghost btn-lg">Request a quote</a>
          </div>
          <div className="hero-meta">
            <span><Icon name="truck" size={16} /> {s.freeShip}</span>
          </div>
        </div>
        <div className="hero-media">
          <div className="hero-img main"><Img src={window.__resources.promoBanner} label="Mid-Year Mega Promo" /></div>
          <div className="hero-img small a"><Img src={window.__resources.storefront} label="our Calgary store" /></div>
          <div className="hero-img small b"><Img src={window.__resources.cta} label="wholesale distribution" /></div>
          <div className="hero-float">
            <div className="hero-float-ic"><Icon name="snow" size={20} /></div>
            <div>
              <div className="hf-k">Flash-frozen</div>
              <div className="hf-v">at peak freshness</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { ic: "box", k: "Packaging first", v: "Containers, cups & cutlery" },
    { ic: "snow", k: "Cold-chain kept", v: "−18°C from dock to door" },
    { ic: "leaf", k: "Eco & custom", v: "Compostable + logo printing" },
    { ic: "truck", k: "Calgary delivery", v: "Free over $250" },
  ];
  return (
    <div className="trust">
      <div className="wrap trust-row">
        {items.map((t) => (
          <div className="trust-item" key={t.k}>
            <div className="trust-ic"><Icon name={t.ic} size={20} /></div>
            <div>
              <div className="trust-k">{t.k}</div>
              <div className="trust-v">{t.v}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryGrid() {
  const store = useStore();
  const cats = store.getCategories();
  const products = store.getProducts();
  const countFor = (id) => products.filter((p) => p.category === id).length;
  const labels = { packaging: "packaging", frozen: "frozen foods",
    "dry-foods": "dry goods", others: "supplies" };
  return (
    <section className="wrap sec">
      <SectionHead eyebrow="What we carry" title="Shop by category"
        link="#/catalogue" linkText="View all products" />
      <div className="cat-grid">
        {cats.map((c, i) => (
          <a key={c.id} href={"#/catalogue?cat=" + c.id} className={"cat-card" + (i === 0 ? " feature" : "")}>
            <div className="cat-card-media"><Img label={labels[c.id] || c.name.toLowerCase()} /></div>
            <div className="cat-card-body">
              <div>
                <h3 className="cat-card-name">{c.name}</h3>
                <p className="cat-card-blurb">{c.blurb}</p>
              </div>
              <div className="cat-card-foot">
                <span className="cat-count">{countFor(c.id)} items</span>
                <span className="cat-go"><Icon name="arrow" size={18} /></span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function FeaturedRow() {
  const store = useStore();
  const featured = store.getProducts().filter((p) => p.featured).slice(0, 4);
  if (!featured.length) return null;
  return (
    <section className="wrap sec">
      <SectionHead eyebrow="Customer favourites" title="Popular this season"
        sub="Restaurant-grade staples our buyers reorder most."
        link="#/catalogue" linkText="See everything" />
      <div className="pgrid">
        {featured.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}

function PromoBand() {
  const store = useStore();
  const promos = store.getProducts().filter((p) => p.promo).slice(0, 5);
  return (
    <section className="promo-band">
      <div className="wrap">
        <div className="promo-inner">
          <div className="promo-copy">
            <div className="eyebrow" style={{ color: "var(--gold-soft)" }}>This month</div>
            <h2 className="promo-h2">Eco takeout packaging,<br/>priced for volume.</h2>
            <p>Compostable clamshells, deli containers, soup bowls, cups and heavy cutlery — stock your line and cut your packaging cost. Want it branded? We also print your logo on takeout boxes and bags. Ask for our current case pricing.</p>
            <a href="#/catalogue?cat=packaging" className="btn btn-gold btn-lg">Shop packaging <Icon name="arrow" size={18} /></a>
          </div>
          <div className="promo-grid">
            {promos.map((p) => (
              <a href={"#/product/" + p.id} key={p.id} className="promo-chip">
                <div className="promo-chip-media"><Img label="pkg" /></div>
                <div className="promo-chip-name">{p.name}</div>
                <div className="promo-chip-pack">{p.pack}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutTeaser() {
  return (
    <section className="wrap sec about-teaser">
      <div className="about-media">
        <Img src={window.__resources.storefront} label="our Calgary store" />
        <div className="about-stat">
          <div className="about-stat-n">4</div>
          <div className="about-stat-l">product categories,<br/>one delivery</div>
        </div>
      </div>
      <div className="about-copy">
        <div className="eyebrow">Our story</div>
        <h2 className="sec-title">A Calgary supplier that kitchens count on.</h2>
        <p>Daison Wholesale is a Calgary packaging and food supplier. Our focus is takeout and foodservice packaging — containers, bowls, cups and cutlery — backed by a tight range of flash-frozen foods, dry goods and everyday essentials. Based in northeast Calgary, we’ve grown into a trusted wholesale partner for restaurants, grocers and food businesses across the city.</p>
        <ul className="about-list">
          <li><Icon name="check" size={18} /> Takeout packaging in case quantities — custom logo printing available</li>
          <li><Icon name="check" size={18} /> One invoice across packaging, frozen &amp; dry goods</li>
          <li><Icon name="check" size={18} /> Cold-chain handling from our facility to yours</li>
        </ul>
        <a href="#/about" className="btn btn-ghost btn-lg">More about us <Icon name="arrow" size={18} /></a>
      </div>
    </section>
  );
}

function QuoteCTA() {
  const s = DaisonStore.getSettings();
  return (
    <section className="wrap">
      <div className="cta-card">
        <div className="cta-left">
          <div className="eyebrow" style={{ color: "var(--gold-soft)" }}>No online checkout — just ask</div>
          <h2 className="cta-h2">Build a list, get a quote.</h2>
          <p>Add the items you need to your quote list and send it over. We’ll reply with current pricing, pack sizes and availability — usually the same day.</p>
        </div>
        <div className="cta-actions">
          <a href="#/catalogue" className="btn btn-gold btn-lg">Start a quote <Icon name="arrow" size={18} /></a>
          <div className="cta-contacts">
            <a href={"tel:" + s.phone}><Icon name="phone" size={16} /> {s.phone}</a>
            <a href={"mailto:" + s.email}><Icon name="mail" size={16} /> {s.email}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <main>
      <HomeHero />
      <TrustStrip />
      <CategoryGrid />
      <FeaturedRow />
      <PromoBand />
      <AboutTeaser />
      <QuoteCTA />
    </main>
  );
}

Object.assign(window, { HomePage });

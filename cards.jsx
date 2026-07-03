/* ===========================================================
   DAISON WHOLESALE — ProductCard + small section helpers
   =========================================================== */

function ProductCard({ p }) {
  const { add } = useQuote();
  const catName = DaisonStore.categoryName(p.category);
  return (
    <article className="pcard">
      <a href={"#/product/" + p.id} className="pcard-media">
        <Img src={p.image} alt={p.name} label="product photo" />
        <div className="pcard-badges">
          {p.promo && <span className="badge promo">Featured deal</span>}
          {!p.promo && p.featured && <span className="badge feat">Popular</span>}
          {p.inStock === false && <span className="badge oos">By request</span>}
        </div>
      </a>
      <div className="pcard-body">
        <div className="pcard-cat">{catName}</div>
        <a href={"#/product/" + p.id}><h3 className="pcard-name">{p.name}</h3></a>
        {p.pack && <div className="pcard-pack">{p.pack}</div>}
        <div className="pcard-foot">
          <button className="btn btn-primary btn-sm pcard-add" onClick={() => add(p)}>
            <Icon name="plus" size={16} /> Add to quote
          </button>
          <a href={"#/product/" + p.id} className="pcard-view" aria-label="View details">
            <Icon name="arrow" size={18} />
          </a>
        </div>
      </div>
    </article>
  );
}

/* section heading with eyebrow + optional link */
function SectionHead({ eyebrow, title, sub, link, linkText }) {
  return (
    <div className="sec-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 className="sec-title">{title}</h2>
        {sub && <p className="sec-sub">{sub}</p>}
      </div>
      {link && <a href={link} className="sec-link">{linkText} <Icon name="arrow" size={17} /></a>}
    </div>
  );
}

Object.assign(window, { ProductCard, SectionHead });

/* ===========================================================
   DAISON WHOLESALE — UI primitives, icons, quote-list context
   =========================================================== */
const { useState, useEffect, useRef, createContext, useContext, useCallback } = React;

/* ---------- icons (simple stroke UI glyphs) ---------- */
function Icon({ name, size = 20, stroke = 1.7, style }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round", style };
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
    menu: <><path d="M3 6h18M3 12h18M3 18h18" /></>,
    close: <><path d="M6 6l12 12M18 6L6 18" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    arrowLeft: <><path d="M19 12H5M11 6l-6 6 6 6" /></>,
    chevDown: <><path d="M6 9l6 6 6-6" /></>,
    chevRight: <><path d="M9 6l6 6-6 6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <><path d="M5 12h14" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></>,
    edit: <><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M14 6l4 4" /></>,
    doc: <><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v4h4" /></>,
    quote: <><path d="M5 7h14M5 12h14M5 17h9" /></>,
    pin: <><path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
    phone: <><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 5.2a3.2 3.2 0 010 5.6M17 14.2c2.4.5 4 2.4 4 4.8" /></>,
    cloud: <><path d="M7 18a4 4 0 010-8 5 5 0 019.6-1.3A3.5 3.5 0 0117 18z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <><path d="M5 12l5 5L20 6" /></>,
    snow: <><path d="M12 2v20M4 6l16 12M20 6L4 18" /></>,
    truck: <><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></>,
    leaf: <><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13z" /><path d="M5 19c4-4 7-6 11-7" /></>,
    shield: <><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z" /><path d="M9 12l2 2 4-4" /></>,
    box: <><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>,
    star: <><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7L7.8 19l1-5.8L4.5 9.2l5.9-.9z" /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" /></>,
    download: <><path d="M12 4v12M7 11l5 5 5-5" /><path d="M4 20h16" /></>,
    grid: <><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></>,
  };
  return <svg {...common} aria-hidden="true">{paths[name] || null}</svg>;
}

/* ---------- placeholder image ---------- */
function Img({ src, alt, label = "product photo", style, className = "", rounded }) {
  const [err, setErr] = useState(false);
  const radius = rounded ? { borderRadius: rounded } : null;
  if (src && !err) {
    return <img src={src} alt={alt || ""} className={className}
      style={{ width: "100%", height: "100%", objectFit: "cover", ...radius, ...style }}
      onError={() => setErr(true)} />;
  }
  return (
    <div className={"ph " + className} style={{ width: "100%", height: "100%", ...radius, ...style }}>
      <span>{label}</span>
    </div>
  );
}

/* ---------- logo (real brand mark, unaltered) ---------- */
function Logo({ light = false, size = 22 }) {
  const ink = light ? "#fdfcf6" : "var(--ink)";
  const badge = size + 22;
  return (
    <a href="#/" className="logo" style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <img src={(window.__resources && window.__resources.logo) || "daison-logo.webp"} alt="Daison Trading Co Ltd."
        style={{ width: badge, height: badge, objectFit: "contain", flex: "none", display: "block" }} />
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: size - 2,
          letterSpacing: "-0.02em", color: ink }}>DAISON</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: "0.32em",
          color: light ? "rgba(253,252,246,.6)" : "var(--gold-600)", marginTop: 3 }}>WHOLESALE</span>
      </span>
    </a>
  );
}

/* ===========================================================
   Quote list context (cart-style, persisted)
   =========================================================== */
const QUOTE_KEY = "daison_quote_v1";
const QuoteCtx = createContext(null);
const useQuote = () => useContext(QuoteCtx);

function QuoteProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(QUOTE_KEY)) || []; } catch (e) { return []; }
  });
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(QUOTE_KEY, JSON.stringify(items)); } catch (e) {}
  }, [items]);

  const add = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === product.id);
      if (i >= 0) { const c = [...prev]; c[i] = { ...c[i], qty: c[i].qty + qty }; return c; }
      return [...prev, { id: product.id, name: product.name, pack: product.pack, image: product.image, qty }];
    });
    setToast(product.name);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const setQty = useCallback((id, qty) => {
    setItems((prev) => prev.map((x) => x.id === id ? { ...x, qty: Math.max(1, qty) } : x));
  }, []);
  const remove = useCallback((id) => setItems((prev) => prev.filter((x) => x.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const count = items.reduce((n, x) => n + x.qty, 0);

  return (
    <QuoteCtx.Provider value={{ items, count, add, setQty, remove, clear, open, setOpen }}>
      {children}
      {toast && (
        <div className="toast">
          <Icon name="check" size={18} />
          <span>Added to quote — <strong>{toast}</strong></span>
        </div>
      )}
    </QuoteCtx.Provider>
  );
}

/* ---------- tiny hook: subscribe to store ---------- */
function useStore() {
  const [, force] = useState(0);
  useEffect(() => DaisonStore.subscribe(() => force((n) => n + 1)), []);
  return DaisonStore;
}

/* ---------- hash router hook ---------- */
function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || "/");
  useEffect(() => {
    const on = () => { setRoute(window.location.hash.slice(1) || "/"); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}
function navigate(path) { window.location.hash = path; }

Object.assign(window, {
  Icon, Img, Logo, QuoteProvider, QuoteCtx, useQuote, useStore, useHashRoute, navigate,
});

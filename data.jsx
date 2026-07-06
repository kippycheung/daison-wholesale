/* ===========================================================
   DAISON WHOLESALE — data layer
   Seed catalogue + localStorage-backed store with CRUD,
   JSON export/import.  All reads/writes go through DaisonStore.
   =========================================================== */

const STORE_KEY = "daison_catalog_v4";

/* ---------- real brand graphics (from daisonwholesale.com CDN) ----------
   Merged so a bundled build's inlined logo data-URI still wins. */
window.__resources = Object.assign({
  logo:        "daison-logo.webp",
  storefront:  "https://dhgf5mcbrms62.cloudfront.net/98294505/cover-PZwCLc/wjHxIKF-200x200.jpg",
  promoBanner: "https://dhgf5mcbrms62.cloudfront.net/98294505/slider-vGjRTW/6CxN2Yx-2000x2000.webp",
  cta:         "https://dhgf5mcbrms62.cloudfront.net/98294505/call-to-action-8bWBUr/UXoeYK7-200x200.jpg",
}, window.__resources || {});

/* ---------- seed categories (packaging is our focus) ---------- */
const SEED_CATEGORIES = [
  { id: "packaging", name: "Packaging",    blurb: "Takeout containers, clamshells, bowls, cups & cutlery — built for volume. Custom-branded packaging available on request." },
  { id: "frozen",    name: "Frozen Foods", blurb: "Flash-frozen at peak freshness and kept at −18°C from our facility to your kitchen." },
  { id: "dry-foods", name: "Dry Foods",    blurb: "Pantry staples — rice, noodles, sauces & oils at true wholesale volume." },
  { id: "others",    name: "Others",       blurb: "Gloves, wraps, cleaning & everyday restaurant essentials." },
];

/* helper to make a product */
let _n = 0;
function P(o) {
  _n += 1;
  return {
    id: o.id || ("seed-" + _n),
    name: o.name,
    category: o.category,
    sku: o.sku || ("DW-" + String(1000 + _n)),
    pack: o.pack || "",
    origin: o.origin || "",
    brand: o.brand || "",
    storage: o.storage || "",
    tags: o.tags || [],
    featured: !!o.featured,
    promo: !!o.promo,
    inStock: o.inStock !== false,
    image: o.image || "",     // data URL or remote URL; "" => placeholder
    short: o.short || "",
    description: o.description || "",
  };
}

const SEED_PRODUCTS = [
  /* ---- packaging (our focus) ---- */
  P({ name: "EP-6 ECO Clamshell Food Container", category: "packaging", pack: "250 / case", tags: ["Compostable"], promo: true, featured: true,
      short: "Sugarcane bagasse, hinged lid. Microwave-safe.",
      description: "Eco-friendly bagasse clamshell with a sturdy hinged lid, microwave safe. A compostable takeout standard." }),
  P({ name: "EP-28 ECO Clamshell (vent / no-vent)", category: "packaging", pack: "150 / case", tags: ["Compostable"], promo: true, featured: true,
      short: "Available with or without vent hole.",
      description: "Bagasse clamshell offered in vented and non-vented versions for hot or crisp foods." }),
  P({ name: "EP-81 ECO Clamshell Food Container", category: "packaging", pack: "150 / case", tags: ["Compostable"], promo: true,
      short: "Bagasse clamshell, single compartment.",
      description: "EP-81 compostable bagasse clamshell. Sturdy, microwave-safe and built for everyday takeout." }),
  P({ name: "EP-73 ECO Clamshell Food Container", category: "packaging", pack: "150 / case", tags: ["Compostable"], promo: true,
      short: "Bagasse clamshell, hinged lid.",
      description: "EP-73 compostable bagasse clamshell with hinged lid. A clean, eco takeout standard." }),
  P({ name: "NEW-61 Clamshell Container", category: "packaging", pack: "250 / case", tags: ["Hinged"], promo: true,
      short: "High-volume hinged clamshell.",
      description: "NEW-61 hinged clamshell container in case packs of 250 — a workhorse for high-volume takeout." }),
  P({ name: "NEW-83 3-Compartment Container", category: "packaging", pack: "150 / case", tags: ["3-comp"], promo: true,
      short: "Keeps mains and sides separate.",
      description: "NEW-83 three-compartment container keeps mains and sides apart — ideal for combo plates and meal prep." }),
  P({ name: "C-16 Deli Container w/ Hard Lid", category: "packaging", pack: "16 oz · 240 / case", tags: ["PP", "Leak-resist"], promo: true, featured: true,
      short: "Crystal-clear PP, snap-tight lid. Stackable.",
      description: "16 oz deli container with leak-resistant hard lid. Clear PP, freezer and microwave safe." }),
  P({ name: "NB1100 Soup Bowl, 36 oz", category: "packaging", pack: "300 / case", tags: ["Kraft"], promo: true,
      short: "Kraft paper bowl for hot soups & noodles.",
      description: "Double-wall kraft soup bowl with matching lids available. Holds 36 oz of hot soup or rice bowls." }),
  P({ name: "Kraft Takeout Box w/ Custom Print", category: "packaging", pack: "MOQ applies · custom", tags: ["Custom", "Kraft"], promo: true, featured: true,
      short: "Your logo, printed on durable kraft boxes.",
      description: "Bring your brand to the table with custom-printed kraft takeout boxes. Add your logo, colours and artwork — minimum order quantities apply. Ask us for a custom packaging quote." }),
  P({ name: "7\" PP Fork, Heavy", category: "packaging", pack: "1000 / case", tags: ["Cutlery"], promo: true,
      short: "Heavy-weight black PP fork. Won't snap.",
      description: "Heavy-duty 7-inch PP fork. Strong enough for takeout mains." }),
  P({ name: "Double-Wall Paper Hot Cup, 12 oz", category: "packaging", pack: "500 / case", tags: ["Hot cup"],
      short: "Insulated 12 oz cup, no sleeve needed.",
      description: "Double-wall paper hot cup that stays comfortable to hold without a sleeve. Lids sold separately." }),

  /* ---- frozen foods ---- */
  P({ name: "Wild-Caught Argentine Red Shrimp", category: "frozen", pack: "2 × 5 lb / case", origin: "Argentina", storage: "Keep frozen -18°C", tags: ["Wild", "IQF"], featured: true,
      short: "Sweet, lobster-like flavour. Shell-on, easy-peel, deveined.",
      description: "Premium wild-caught red shrimp harvested in the cold South Atlantic. Naturally sweet with a firm, lobster-like texture. Individually quick-frozen to lock in freshness. A restaurant favourite for ceviche, grilling and pasta." }),
  P({ name: "Atlantic Salmon Fillet, Skin-On", category: "frozen", pack: "10 lb / case", origin: "Norway", storage: "Keep frozen -18°C", tags: ["Farmed", "Portioned"], featured: true,
      short: "Vac-packed 6–8 oz portions. Bright colour, high oil content.",
      description: "Responsibly farmed Atlantic salmon, cut into uniform skin-on portions and vacuum-sealed individually. Consistent size for plating, rich flavour and excellent yield." }),
  P({ name: "Black Tiger Shrimp 16/20", category: "frozen", pack: "6 × 2 lb / case", origin: "Vietnam", storage: "Keep frozen -18°C", tags: ["Farmed", "Headless"],
      short: "Headless, shell-on. Firm bite, great for grilling.",
      description: "Large 16/20 count black tiger shrimp, headless and shell-on. Firm texture holds up to high heat — ideal for skewers, stir-fry and butter garlic prawns." }),
  P({ name: "Whole Squid Tubes & Tentacles", category: "frozen", pack: "10 × 1 kg / case", origin: "India", storage: "Keep frozen -18°C", tags: ["Cleaned"],
      short: "Cleaned tubes & tentacles, ready to ring or stuff.",
      description: "Cleaned and ready-to-use squid, blast frozen. Versatile for calamari, grilling, and seafood stews." }),
  P({ name: "Frozen Edamame, Shelled", category: "frozen", pack: "12 × 1 kg / case", origin: "China", storage: "Keep frozen -18°C", tags: ["IQF"],
      short: "Bright, blanched & shelled. Ready to heat.",
      description: "Blanched shelled edamame, IQF. A quick protein-rich side or salad topper." }),
  P({ name: "Mixed Stir-Fry Vegetables", category: "frozen", pack: "6 × 2 kg / case", origin: "Canada", storage: "Keep frozen -18°C", tags: ["IQF", "Blend"],
      short: "Broccoli, carrot, snap pea & pepper blend.",
      description: "A vibrant restaurant-grade stir-fry blend, IQF for even cooking and zero waste." }),
  P({ name: "Hand-Wrapped Spring Rolls", category: "frozen", pack: "8 × 50 pc / case", origin: "Vietnam", storage: "Keep frozen -18°C", tags: ["Appetizer"],
      short: "Crisp veggie rolls, fry straight from frozen.",
      description: "Hand-wrapped vegetable spring rolls, blast frozen. Fry from frozen for a fast, crowd-pleasing appetizer." }),

  /* ---- dry foods ---- */
  P({ name: "Jasmine Rice, Premium", category: "dry-foods", pack: "50 lb / bag", origin: "Thailand", storage: "Cool & dry", tags: ["Long grain"], featured: true,
      short: "Fragrant long-grain. Consistent cook, low broken.",
      description: "Premium Thai jasmine rice, fragrant and fluffy with a low broken-grain ratio. A foodservice staple." }),
  P({ name: "Light Soy Sauce", category: "dry-foods", pack: "6 × 1.8 L / case", origin: "China", storage: "Ambient", tags: ["Sauce"],
      short: "All-purpose brewed soy. Balanced salt & umami.",
      description: "Naturally brewed light soy sauce in foodservice jugs. Balanced for seasoning, marinades and dipping." }),
  P({ name: "Canola Frying Oil", category: "dry-foods", pack: "16 L / jug", origin: "Canada", storage: "Ambient", tags: ["Oil"],
      short: "High smoke point, neutral. Long fryer life.",
      description: "Clear canola oil formulated for deep frying — neutral flavour and extended fryer life." }),
  P({ name: "Rice Vermicelli Noodles", category: "dry-foods", pack: "30 × 400 g / case", origin: "Vietnam", storage: "Ambient", tags: ["Noodle"],
      short: "Thin rice sticks. Soak & serve for bún & pho.",
      description: "Thin rice vermicelli for soups, salads and spring rolls. Quick-soak, consistent texture." }),

  /* ---- others ---- */
  P({ name: "Heavy-Duty Nitrile Cleaning Gloves", category: "others", pack: "12 pair / case", tags: ["Reusable"], promo: true,
      short: "Flock-lined, chemical-resistant. Reusable.",
      description: "Durable flock-lined nitrile gloves for dishwashing and cleaning. Chemical resistant and reusable." }),
  P({ name: "Nitrile Disposable Gloves, Powder-Free", category: "others", pack: "10 × 100 / case", tags: ["Food-safe"],
      short: "Food-safe, powder-free. Box of 100.",
      description: "Powder-free food-safe nitrile gloves. Snug fit, strong puncture resistance." }),
  P({ name: "Foodservice Cling Film, 18\"", category: "others", pack: "1 roll · 2000 ft", tags: ["Wrap"],
      short: "Cutter-box film for the line. Clings cold.",
      description: "18-inch foodservice cling film in a cutter box. Strong cling for cold storage and prep." }),
];

/* ===========================================================
   Editable home-page content (defaults; overridable in Admin)
   =========================================================== */
const HOME_ICON_CHOICES = ["box", "snow", "leaf", "truck", "shield", "star", "check", "pin", "clock", "phone", "mail", "doc", "cloud"];

const HOME_DEFAULTS = {
  heroTag: "Calgary, Alberta",
  heroTitle: "Wholesale packaging, frozen & dry foods — delivered across Calgary.",
  heroSub: "Daison Wholesale supplies restaurants, grocers and foodservice with takeout packaging, flash-frozen foods, dry goods and everyday essentials — at true wholesale volume. Custom-branded packaging available on request.",
  heroFloatK: "Flash-frozen",
  heroFloatV: "at peak freshness",
  heroImgMain: "", heroImgA: "", heroImgB: "",   // "" → fall back to window.__resources.*
  trust: [
    { ic: "box", k: "Packaging first", v: "Containers, cups & cutlery" },
    { ic: "snow", k: "Cold-chain kept", v: "−18°C from dock to door" },
    { ic: "leaf", k: "Eco & custom", v: "Compostable + logo printing" },
    { ic: "truck", k: "Calgary delivery", v: "Free over $250" },
  ],
  promoTitle: "Eco takeout packaging, priced for volume.",
  promoText: "Compostable clamshells, deli containers, soup bowls, cups and heavy cutlery — stock your line and cut your packaging cost. Want it branded? We also print your logo on takeout boxes and bags. Ask for our current case pricing.",
  promoBanner: "",   // 1200×630 banner, shown whole; "" → default
  aboutTitle: "A Calgary supplier that kitchens count on.",
  aboutText: "Daison Wholesale is a Calgary packaging and food supplier. Our focus is takeout and foodservice packaging — containers, bowls, cups and cutlery — backed by a tight range of flash-frozen foods, dry goods and everyday essentials. Based in northeast Calgary, we’ve grown into a trusted wholesale partner for restaurants, grocers and food businesses across the city.",
  aboutImg: "",
  aboutStatN: "4",
  aboutStatL: "product categories, one delivery",
};

/* Merge saved home content over defaults so older saved settings still work. */
function mergeHome(saved) {
  const h = Object.assign({}, HOME_DEFAULTS, saved || {});
  if (!Array.isArray(h.trust) || !h.trust.length) h.trust = HOME_DEFAULTS.trust;
  return h;
}

/* ===========================================================
   Store
   =========================================================== */
const DaisonStore = (function () {
  const listeners = new Set();

  function freshSeed() {
    /* Published data (from catalogue.js → window.__seedCatalogue) wins.
       Until the owner publishes once, the built-in starter catalogue is used. */
    const pub = window.__seedCatalogue;
    if (pub && Array.isArray(pub.products) && Array.isArray(pub.categories)) {
      const clone = JSON.parse(JSON.stringify(pub));
      delete clone.__draft;
      if (!clone.settings) clone.settings = defaultSettings();
      return clone;
    }
    return {
      categories: JSON.parse(JSON.stringify(SEED_CATEGORIES)),
      products: JSON.parse(JSON.stringify(SEED_PRODUCTS)),
      settings: defaultSettings(),
    };
  }

  function defaultSettings() {
    return {
      freeShip: "Free delivery within Calgary on orders over $250",
      phone: "587-779-7077",
      email: "daisonwholesale@gmail.com",
      address: "609-28 St NE, Calgary, AB T2A 4L6, Canada",
      hours: "Mon–Fri 9:00–5:00 · Sat 10:00–4:00 · Sun & Holidays Closed",
      mapQuery: "609-28 St NE, Calgary, AB T2A 4L6",
      home: JSON.parse(JSON.stringify(HOME_DEFAULTS)),
    };
  }

  function load() {
    /* Only a saved *draft* (the owner's unpublished edits) overrides the
       published catalogue. Regular visitors always get the latest publish. */
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.__draft && parsed.categories && parsed.products) {
          if (!parsed.settings) parsed.settings = defaultSettings();
          return parsed;
        }
      }
    } catch (e) {}
    return freshSeed();
  }

  function save(state) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  let state = load();

  /* ---------- server mode (Vercel + Neon) ----------
     When /api/catalogue answers, the site reads & writes the database and
     admin edits go live instantly. When it doesn't (preview, standalone
     file, plain static host), we silently fall back to the local seed +
     localStorage flow below. */
  const apiBase = window.__API_BASE || "";
  let serverMode = false;
  let serverEmpty = false;
  let sync = "idle"; // idle | saving | saved | error | auth
  let syncTimer = null;

  function notify() { listeners.forEach((fn) => fn(state)); }
  function setSync(s) { sync = s; notify(); }

  function scheduleSync() {
    clearTimeout(syncTimer);
    setSync("saving");
    syncTimer = setTimeout(doSync, 700);
  }
  async function doSync() {
    try {
      const r = await fetch(apiBase + "/api/catalogue", {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: state.categories, products: state.products, settings: state.settings }),
      });
      if (r.status === 401) { setSync("auth"); return; }
      if (!r.ok) throw new Error("PUT " + r.status);
      serverEmpty = false;
      setSync("saved");
    } catch (e) { setSync("error"); }
  }

  async function init() {
    try {
      const r = await fetch(apiBase + "/api/catalogue", { credentials: "include" });
      if (!r.ok) return; // 404 etc -> stay in static mode
      const ct = r.headers.get("content-type") || "";
      if (!ct.includes("application/json")) return; // HTML fallback -> static
      const data = await r.json();
      if (!data || (data.empty !== true && (!Array.isArray(data.categories) || !Array.isArray(data.products)))) return;
      serverMode = true;
      if (!data.empty) {
        state = {
          categories: data.categories,
          products: data.products,
          settings: Object.assign(defaultSettings(), data.settings || {}),
        };
      } else {
        // DB reachable but not initialised yet — keep showing the seed so the
        // public site isn't empty; admin gets a one-click "Initialise" action.
        serverEmpty = true;
        state = freshSeed(); delete state.__draft;
      }
      notify();
    } catch (e) { serverMode = false; /* offline / static — fine */ }
  }

  function emit() {
    if (serverMode) { notify(); scheduleSync(); }
    else { state.__draft = true; save(state); notify(); }
  }

  return {
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    get() { return state; },
    getProducts() { return state.products; },
    getCategories() { return state.categories; },
    getSettings() { return state.settings; },
    getHome() { return mergeHome(state.settings && state.settings.home); },
    iconChoices() { return HOME_ICON_CHOICES.slice(); },
    getProduct(id) { return state.products.find((p) => p.id === id); },
    categoryName(id) { const c = state.categories.find((c) => c.id === id); return c ? c.name : id; },

    upsertProduct(p) {
      const idx = state.products.findIndex((x) => x.id === p.id);
      if (idx >= 0) state.products[idx] = p;
      else state.products = [{ ...p, id: p.id || ("p-" + Date.now()) }, ...state.products];
      emit();
    },
    deleteProduct(id) {
      state.products = state.products.filter((p) => p.id !== id);
      emit();
    },
    upsertCategory(c) {
      const idx = state.categories.findIndex((x) => x.id === c.id);
      if (idx >= 0) state.categories[idx] = c;
      else state.categories = [...state.categories, c];
      emit();
    },
    deleteCategory(id) {
      state.categories = state.categories.filter((c) => c.id !== id);
      emit();
    },
    updateSettings(s) { state.settings = { ...state.settings, ...s }; emit(); },
    updateHome(patch) {
      const home = Object.assign({}, mergeHome(state.settings.home), patch);
      state.settings = Object.assign({}, state.settings, { home });
      emit();
    },

    /* Send a quote / contact request. Tries the server endpoint first
       (real email via /api/contact); falls back to opening the mail app. */
    async sendQuote(payload) {
      try {
        const r = await fetch((window.__API_BASE || "") + "/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const ct = r.headers.get("content-type") || "";
        if (r.ok && ct.includes("application/json")) {
          const d = await r.json();
          if (d && d.ok) return { ok: true, method: "email" };
          return { ok: false, method: "email", error: (d && d.error) || "Send failed" };
        }
        if (r.status === 404) return { ok: false, method: "none", error: "no-endpoint" };
        return { ok: false, method: "email", error: "Send failed (" + r.status + ")" };
      } catch (e) {
        return { ok: false, method: "none", error: "network" };
      }
    },

    /* ---- server mode ---- */
    init,
    serverMode() { return serverMode; },
    serverEmpty() { return serverEmpty; },
    syncStatus() { return sync; },
    retrySync() { doSync(); },
    async initFromSeed() {           // push the in-memory seed to the empty DB
      await doSync();
    },

    /* true once the owner has made edits that haven't been published yet */
    isDraft() { return !!state.__draft; },

    /* revert to the live/published catalogue, discarding local edits */
    discardDraft() { try { localStorage.removeItem(STORE_KEY); } catch (e) {} state = freshSeed(); listeners.forEach((fn) => fn(state)); },
    resetToSeed() { this.discardDraft(); },

    /* JSON backup */
    exportJSON() { const out = { ...state }; delete out.__draft; return JSON.stringify(out, null, 2); },

    /* the publishable file: drop into the project as catalogue.js + redeploy */
    exportPublishJS() {
      const out = { categories: state.categories, products: state.products, settings: state.settings };
      return "/* Daison Wholesale \u2014 PUBLISHED catalogue. Generated by Admin \u2192 Publish on "
        + new Date().toISOString().slice(0, 10)
        + ". Replace catalogue.js in your project with this file, then redeploy. */\n"
        + "window.__seedCatalogue = " + JSON.stringify(out) + ";\n";
    },
    importJSON(text) {
      const parsed = JSON.parse(text);
      if (!parsed.categories || !parsed.products) throw new Error("Invalid catalogue file");
      if (!parsed.settings) parsed.settings = freshSeed().settings;
      state = parsed; state.__draft = true; emit();
    },
  };
})();

/* slugify for ids */
function slugify(s) {
  return (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

window.DaisonStore = DaisonStore;
window.slugify = slugify;

/* Kick off server detection. No-op (silent) when there's no /api backend. */
DaisonStore.init();

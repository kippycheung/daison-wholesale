/* ===========================================================
   DAISON WHOLESALE — App shell + hash router
   =========================================================== */

function App() {
  const route = useHashRoute();
  const path = route.split("?")[0];

  let page;
  if (path === "/" || path === "") page = <HomePage />;
  else if (path === "/catalogue") page = <CataloguePage route={route} />;
  else if (path.startsWith("/product/")) page = <ProductPage id={path.replace("/product/", "")} />;
  else if (path === "/contact") page = <ContactPage route={route} />;
  else if (path === "/about") page = <AboutPage />;
  else if (path === "/admin") page = <AdminGate />;
  else page = <HomePage />;

  const isAdmin = path === "/admin";

  return (
    <QuoteProvider>
      {!isAdmin && <Header />}
      {page}
      {!isAdmin && <Footer />}
      {!isAdmin && <QuoteDrawer />}
    </QuoteProvider>
  );
}

/* Catches any render error so the page shows a message instead of going blank. */
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error("App render error:", err, info); }
  render() {
    if (this.state.err) {
      return (
        <div style={{ maxWidth: 640, margin: "80px auto", padding: "0 24px", fontFamily: "Poppins, system-ui, sans-serif", color: "#222", textAlign: "center" }}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Something didn’t load</h1>
          <p style={{ color: "#666", lineHeight: 1.6 }}>A file may not have finished deploying. Try a hard refresh (Ctrl/Cmd + Shift + R). If it persists, one of the site files likely didn’t upload — re-upload all files and redeploy.</p>
          <pre style={{ textAlign: "left", background: "#f5f3ee", padding: 14, borderRadius: 10, marginTop: 18, fontSize: 12, overflow: "auto", color: "#a33" }}>{String(this.state.err && this.state.err.message || this.state.err)}</pre>
          <a href="#/" onClick={() => location.reload()} style={{ display: "inline-block", marginTop: 18, color: "#161616", fontWeight: 700 }}>Reload</a>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary><App /></ErrorBoundary>
);

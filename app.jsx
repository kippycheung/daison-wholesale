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

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

import { Outlet, ScrollRestoration } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";
function Layout() {
  return (
    <>
      <NavBar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}

export default Layout;

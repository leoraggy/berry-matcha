import { Outlet, ScrollRestoration } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";
import styles from "./styles/Layout.module.css";
function Layout() {
  return (
    <>
      <NavBar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}

export default Layout;

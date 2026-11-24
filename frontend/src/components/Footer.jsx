import styles from "./styles/Footer.module.css";
import { Link } from "react-router-dom";
function Footer() {
  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <img
            src="/favicon.png"
            alt="logo"
            width={150}
            className={styles["grid-item"]}
          />
          <div className={`${styles.contact} ${styles["grid-item"]}`}>
            <h3>Contact Me</h3>
            <Link to="/about">About</Link>
            <br /> <br />
            <Link to="/admin">Admin</Link>
            <p>LinCr@cwu.edu</p>
            <p>425-757-7587</p>
          </div>
          <div className={`${styles.hours} ${styles["grid-item"]}`}>
            <h3>Locations</h3>
            <p>1900 N. Brooklane St Apt i3</p>
            <p>Westfield Southcenter Macy's Court</p>
          </div>
        </div>
        <hr />
        <div className={styles["bottom-footer"]}>
          <p>Berry Matcha · 2026</p>
          <a href="mailto:LinCr@cwu.edu">
            <img src="/email.png" alt="email" width={25} />
          </a>
          <a href="https://www.instagram.com/berry_matcha.co/" target="_blank">
            <img src="/instagram.png" alt="instagram" width={25} />
          </a>
        </div>
      </footer>
    </>
  );
}

export default Footer;

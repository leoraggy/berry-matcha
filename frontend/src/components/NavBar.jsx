import { Link } from "react-router-dom";
import styles from "./styles/NavBar.module.css";
import { useState } from "react";
import "/berrymatcha.png";
import "/cart.png";
import "/carthover.png";
import Hamburger from "hamburger-react";

function NavBar() {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className={styles.navWrapper}>
      <nav className={styles["nav-bar"]}>
        <div>
          <Link to="/" className={styles.links}>
            <div className={styles.links}>
              <img
                src="berrymatcha.png"
                className={styles.logo}
                alt="image of logo"
                width={80}
              />
            </div>
          </Link>
        </div>

        <div className={styles.desktop}>
          <div className={styles["links-container"]}>
            <Link to="/about" className={styles.links}>
              <div>
                <p>About</p>
              </div>
            </Link>
            <Link to="/menu" className={styles.links}>
              <div>
                <p>Menu</p>
              </div>
            </Link>
            <Link to="/order" className={styles.links}>
              <p className={styles.links}>
                <img
                  src="/cart.png"
                  onMouseOver={(e) => (e.currentTarget.src = "/carthover.png")}
                  onMouseLeave={(e) => (e.currentTarget.src = "/cart.png")}
                  width={50}
                />
              </p>
            </Link>
          </div>
        </div>

        <div className={styles.mobile}>
          <Hamburger toggled={isOpen} toggle={setOpen} />
        </div>
      </nav>
      <div
        className={`${styles.mobileModal}${isOpen ? ` ${styles.mobileModalOpen}` : ""}`}
      >
        <div className={styles.mobileModalContent}>
          <Link
            to="/about"
            className={styles.mobileLink}
            onClick={() => setOpen(false)}
          >
            <div>
              <p>About</p>
            </div>
          </Link>
          <Link
            to="/menu"
            className={styles.mobileLink}
            onClick={() => setOpen(false)}
          >
            <div>
              <p>Menu</p>
            </div>
          </Link>
          <Link
            to="/order"
            className={styles.mobileLink}
            onClick={() => setOpen(false)}
          >
            <div className={styles.orderLink}>
              <p>Order</p>
              <img src="/cart.png" width={45} height={45} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NavBar;

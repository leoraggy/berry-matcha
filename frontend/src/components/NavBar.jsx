import { Link } from "react-router-dom";
import styles from "./styles/NavBar.module.css";
import "/berrymatcha.png";
import "/cart.png";
import "/carthover.png";
function NavBar() {
  return (
    <div>
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
      </nav>
    </div>
  );
}

export default NavBar;

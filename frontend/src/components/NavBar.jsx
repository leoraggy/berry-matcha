import { Link, Outlet, useLocation } from "react-router-dom";
import "./styles/NavBar.css";
import "/berrymatcha.png";
import "/cart.png";
import "/carthover.png";
import Footer from "./Footer";
function NavBar() {
  const location = useLocation();
  return (
    <div>
      <nav className="nav-bar">
        <div>
          <Link to="/" className="links">
            <div className="links">
              <img
                src="berrymatcha.png"
                className="logo"
                alt="image of logo"
                width={80}
              />
            </div>
          </Link>
        </div>

        <div className="links-container">
          <Link to="/about" className="links">
            <div>
              <p>About</p>
            </div>
          </Link>
          <Link to="/menu" className="links">
            <div>
              <p>Menu</p>
            </div>
          </Link>
          <Link to="/order" className="links">
            <a className="links">
              <img
                src="/cart.png"
                onMouseOver={(e) => (e.currentTarget.src = "/carthover.png")}
                onMouseLeave={(e) => (e.currentTarget.src = "/cart.png")}
                width={50}
              />
              {/* Cart */}
            </a>
          </Link>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default NavBar;

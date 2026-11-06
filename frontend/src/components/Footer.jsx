import "./styles/Footer.css";
import "/favicon.png";
import "/instagram.png";
import "/email.png";
import { Link } from "react-router-dom";
function Footer() {
  return (
    <>
      <footer>
        <div className="container">
          <img src="favicon.png" alt="logo" width={150} className="grid-item" />
          <div className="contact grid-item">
            <h3>Contact Me</h3>
            <Link href="/about">About</Link>
            <p>LinCr@cwu.edu</p>
            <p>425-757-7587</p>
            <p>1900 N. Brooklane St Apt i3</p>
          </div>
          <div className="hours grid-item">
            <h3>Hours of Operation</h3>
            <p>Mon: 9:00am - 10:00am, 4:00 pm-5:00pm </p>
            <p>Tues: 10:00am - 5:00pm </p>
            <p>Wed: 9:00am - 11:00am, 4:00pm-5:00pm</p>
            <p>Thu: 10:00 am - 5:00pm</p>
            <p>Fri: 7:30am - 8:30am</p>
            <p>Sat: Closed</p>
            <p>Sun: Closed</p>
          </div>
        </div>
        <hr />
        <div className="bottom-footer">
          <p>Berry Matcha · 2026</p>
          <a href="mailto:LinCr@cwu.edu">
            <img src="email.png" alt="email" width={25} />
          </a>
          <a href="https://www.instagram.com/berry_matcha.co/" target="_blank">
            <img src="instagram.png" alt="instagram" width={25} />
          </a>
        </div>
      </footer>
    </>
  );
}

export default Footer;

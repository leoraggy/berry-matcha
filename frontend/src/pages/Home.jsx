import "/banner.jpg";
import "/whisk.JPG";
import "/thai.JPG";
import "/lineofmatcha.jpg";
import "/group1.JPG";
import "/group2.JPG";
import "./styles/Home.css";
import "/instagram.png";
import { Link } from "react-router-dom";
import RevealOnScroll from "../components/RevealOnScroll";

function Home() {
  return (
    <div>
      <title>Berry Matcha</title>
      <RevealOnScroll>
        <img
          src="banner.jpg"
          alt=""
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </RevealOnScroll>
      <RevealOnScroll className="story-container">
        <div className="story-item-1">
          <h1>My Story</h1>
          <p>
            A small student run matcha business specializing in fresh,
            handcrafted flavored matcha drinks made with high quality
            ingredients but make it affordable.
          </p>
          <Link className="learn-more" to={`/about`}>
            Learn More
          </Link>
        </div>
        <img src="whisk.JPG" alt="" width={350} />
      </RevealOnScroll>
      <RevealOnScroll className="picture-container">
        <h2>
          Join us in our Berry Matcha journey by following our social media!
        </h2>
        <div className="grid-container">
          <img src="group1.JPG" alt="" />
          <img src="lineofmatcha.jpg" alt="" id="matcha" />
          <img src="thai.JPG" alt="" id="thai" />
          <img src="group2.JPG" alt="" id="group2" />
        </div>
        <h1 className="instagram">
          Follow me on instagram{"  "}
          <a href="https://www.instagram.com/berry_matcha.co/" target="_blank">
            @berry_matcha.co
          </a>
        </h1>
      </RevealOnScroll>
      <RevealOnScroll className="menu-container">
        <h1>Explore the drinks!</h1>
        <p>
          Fresh matcha drinks made to order. Matcha are high quality. Different
          kinds of matcha powder sourced from Japan.
        </p>
        <Link className="learn-more" to={`/menu`}>
          Explore Menu
        </Link>
      </RevealOnScroll>
    </div>
  );
}

export default Home;

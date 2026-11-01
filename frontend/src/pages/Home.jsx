import "/banner.jpg";
import "/whisk.JPG";
import "/thai.JPG";
import "/lineofmatcha.JPG";
import "/group1.JPG";
import "/group2.JPG";
import "./styles/Home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <title>Berry Matcha</title>
      <img
        src="banner.jpg"
        alt=""
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />
      <div className="story-container">
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
      </div>
      <div className="picture-container">
        <h2>
          Matcha are high quality! Different kinds of matcha powder sourced from
          Japan!
        </h2>
        <div className="grid-container">
          <img src="group1.JPG" alt="" />
          <img src="lineofmatcha.JPG" alt="" id="matcha" />
          <img src="thai.JPG" alt="" id="thai" />
          <img src="group2.JPG" alt="" id="group2" />
        </div>
      </div>
      <div className="menu-container">
        <h1>Explore the drinks!</h1>
        <p>Fresh matcha drinks made to order. </p>
        <Link className="learn-more" to={`/about`}>
          Explore Menu
        </Link>
      </div>
    </div>
  );
}

export default Home;

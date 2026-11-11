import "/headshot.jpg";
import "/kitchen.jpg";
import styles from "./styles/About.module.css";
import RevealOnScroll from "../components/RevealOnScroll";
function About() {
  return (
    <div className={styles["about-page"]}>
      <title>Berry Matcha | About The Owner</title>
      <RevealOnScroll>
        <div className={styles["owner-container"]}>
          <div className={styles.section}>
            <div className={styles.owner}>
              <div>
                <h1
                  className={`${styles["owner-text"]} ${styles["meet-owner"]}`}
                  id="meet-owner"
                >
                  Meet the Owner
                </h1>
                <p className={styles["owner-text"]}>
                  Hello my name is Crystal. I'm currently a second year in CWU,
                  majoring in Business Finance with a Economics, Entrepuership,
                  Digital Marketing minors! I didn't like store brought matchas
                  as much but some small business ones at pop up events I do
                  like but they ended being way to pricey so when I was
                  experiementing on making matchas with my friends around me
                  they loved it (they don't like matcha). During Spring 2026 I
                  got encouraged to start a matcha business so here I am!
                </p>
              </div>
              <img src="headshot.jpg" alt="image of owner" width={400} />
            </div>
          </div>
        </div>
        <a className={styles["read-more"]} href="#description">
          <h4>Read More ▼</h4>
        </a>
      </RevealOnScroll>

      <div className={styles.description} id="description">
        <RevealOnScroll className={styles.section}>
          <h2>Why My Matcha</h2>
          <p>
            I focus on bold/balanced flavors, creamy/refreshing teaxtures, and
            fresh ingredients to create a berry matcha experience you can enjoy
            on campus or in Ellensburg! All my matcha are sourced from Japan and
            all drinks thats currently on menu have went through process of
            experimenting with my opinions and a lot of others. So I'm not
            biased also you can customize sweetness level and Ice level during
            confrimation! I used a traditional bamboo whisk also known as the
            Chasen to whisk my matcha instead of blending it that have the
            grainy taste!
          </p>

          <br />

          <h2>Making this in my kitchen!</h2>

          <img
            className={styles.kitchen}
            src="kitchen.jpg"
            alt="image of kitchen"
            width={1000}
          />
        </RevealOnScroll>

        <RevealOnScroll className={styles.section}>
          <h2>FAQ</h2>
          <p>
            <span>Q:</span> Do you take delivery?
          </p>
          <p>
            <span>A:</span> Currently pickup only.
          </p>
          <br />
          <p>
            <span>Q:</span> When are you avaiable for pickups?
          </p>
          <p>
            <span>A:</span> My availability changes each quarter; you can find
            my current pickup availability here.
          </p>
          <br />
          <p>
            <span>Q:</span> Do you have toppings?
          </p>
          <p>
            <span>A:</span> Not at the moment.
          </p>
          <br />
          <p>
            <span>Q:</span> Can I adjust sweetness and ice level?
          </p>
          <p>
            <span>A:</span> Yes, at checkout you can adjust!
          </p>
          <br />
          <p>
            <span>Q:</span> Who made this really cute website?
          </p>
          <p>
            <span>A:</span> Leo Ragual and Erica Maes! linkedin.com/leoragual
          </p>
        </RevealOnScroll>
      </div>
    </div>
  );
}

export default About;

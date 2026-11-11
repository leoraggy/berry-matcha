import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DrinkRepository from "../data/drinkRepository";
import styles from "./styles/DrinkDetails.module.css";
const drinkRepository = new DrinkRepository();

function DrinkDetails() {
  const { id } = useParams();
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const requestKey = `${id}:${retryAttempt}`;

  useEffect(() => {
    let isCurrentRequest = true;

    drinkRepository
      .getDrinkById(id)
      .then((drink) => {
        if (isCurrentRequest) {
          setResult({ requestKey, drink });
        }
      })
      .catch(() => {
        if (isCurrentRequest) {
          setResult({ requestKey, error: true });
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [id, requestKey]);

  if (result?.requestKey !== requestKey) {
    return (
      <div className={styles["drink-details-status"]} role="status">
        <img src="/loading.gif" alt="" width={100} />
        <p>Whisking up your drink details...</p>
      </div>
    );
  }

  if (result.error || !result.drink) {
    return (
      <section
        className={`${styles["drink-details-status"]} ${styles["drink-details-error"]}`}
      >
        <span className={styles["drink-details-eyebrow"]}>A little mix-up</span>
        <h1>We couldn't find that drink</h1>
        <p>
          It may have moved off the menu. Please try again or browse our drinks.
        </p>
        <div className={styles["drink-details-actions"]}>
          <button
            className={styles["drink-details-button"]}
            onClick={() => setRetryAttempt((attempt) => attempt + 1)}
            type="button"
          >
            Try again
          </button>
          <Link className={styles["drink-details-link"]} to="/menu">
            Back to menu
          </Link>
        </div>
      </section>
    );
  }

  const { name, price, category, imageLink, description } = result.drink;

  return (
    <div className={styles["drink-details-page"]}>
      <div className={styles["drink-details-breadcrumb"]}>
        <Link to="/menu">Menu</Link>
        <span aria-hidden="true">/</span>
        <span>{name}</span>
      </div>

      <section className={styles["drink-details-hero"]}>
        <div className={styles["drink-details-image-wrap"]}>
          <img
            className={styles["drink-details-image"]}
            src={imageLink || "/boba.jpg"}
            alt={name}
          />
        </div>

        <div className={styles["drink-details-copy"]}>
          <span className={styles["drink-details-eyebrow"]}>
            {category || "Berry Matcha favorite"}
          </span>
          <h1>{name}</h1>
          <p className={styles["drink-details-intro"]}>{description}</p>
          <div className={styles["drink-details-purchase"]}>
            <div className={styles["drink-details-price"]}>
              <strong>${Number(price).toFixed(2)}</strong>
            </div>
            <Link className={styles["drink-details-button"]} to="/order">
              Order Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DrinkDetails;

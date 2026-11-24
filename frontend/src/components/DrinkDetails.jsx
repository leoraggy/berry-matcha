import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DrinkRepository from "../data/drinkRepository";
import { addCartItem, getAvailableToppings } from "../data/cartService";
import styles from "./styles/DrinkDetails.module.css";
const drinkRepository = new DrinkRepository();

function DrinkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sugar, setSugar] = useState("Full");
  const [ice, setIce] = useState("Normal");
  const [availableToppings, setAvailableToppings] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [toppingsError, setToppingsError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [cartError, setCartError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const requestKey = `${id}:${retryAttempt}`;

  useEffect(() => {
    let isCurrentRequest = true;

    getAvailableToppings()
      .then((toppings) => {
        if (isCurrentRequest) {
          setAvailableToppings(toppings);
        }
      })
      .catch((error) => {
        if (isCurrentRequest) {
          setToppingsError(
            error.message || "Unable to load available toppings.",
          );
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

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

  const handleAddToCart = async () => {
    setIsAdding(true);
    setCartError("");
    setCartMessage("");

    try {
      await addCartItem({
        drinkId: result.drink._id,
        quantity,
        sugar,
        ice,
        toppings: selectedToppings,
      });
      setCartMessage("Added to your cart.");
    } catch (error) {
      setCartError(error.message || "Unable to add this drink to your cart.");
    } finally {
      setIsAdding(false);
    }
  };

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
      <div
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
      </div>
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

      <div className={styles["drink-details-hero"]}>
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
            <div className={styles["drink-details-options"]}>
              <label>
                Quantity
                <select
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((amount) => (
                    <option key={amount} value={amount}>
                      {amount}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Sugar
                <select
                  value={sugar}
                  onChange={(event) => setSugar(event.target.value)}
                >
                  <option value="Full">Full</option>
                  <option value="Half">Half</option>
                  <option value="Zero">Zero</option>
                </select>
              </label>
              <label>
                Ice
                <select
                  value={ice}
                  onChange={(event) => setIce(event.target.value)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Less">Less</option>
                  <option value="No">No</option>
                </select>
              </label>
              {availableToppings.length > 0 && (
                <fieldset className={styles["drink-details-toppings"]}>
                  <legend>Add toppings</legend>
                  {availableToppings.map((topping) => (
                    <label key={topping._id}>
                      <input
                        type="checkbox"
                        checked={selectedToppings.includes(topping._id)}
                        disabled={
                          !selectedToppings.includes(topping._id) &&
                          selectedToppings.length >= 5
                        }
                        onChange={(event) =>
                          setSelectedToppings((currentToppings) =>
                            event.target.checked
                              ? [...currentToppings, topping._id]
                              : currentToppings.filter(
                                  (toppingId) => toppingId !== topping._id,
                                ),
                          )
                        }
                      />
                      {topping.name}
                    </label>
                  ))}
                </fieldset>
              )}
              <button
                className={styles["drink-details-button"]}
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding || !result.drink.isAvailable}
              >
                {isAdding ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
          {toppingsError && (
            <p className={styles["drink-details-cart-error"]} role="alert">
              {toppingsError}
            </p>
          )}
          {cartError && <p className={styles["drink-details-cart-error"]} role="alert">{cartError}</p>}
          {cartMessage && (
            <p className={styles["drink-details-cart-message"]} role="status">
              {cartMessage} <button type="button" onClick={() => navigate("/order")}>View cart</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DrinkDetails;

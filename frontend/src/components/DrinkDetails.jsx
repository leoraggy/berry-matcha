import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addCartItem } from "../data/cartService";
import styles from "./styles/DrinkDetails.module.css";

function DrinkDetails({ drink, toppings }) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [sugar, setSugar] = useState("Full");
  const [ice, setIce] = useState("Normal");
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [cartError, setCartError] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  const handleAddToCart = async () => {
    setIsAdding(true);
    setCartError("");
    setCartMessage("");

    try {
      await addCartItem({
        drinkId: drink._id,
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

  const { name, price, category, imageLink, description } = drink;

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
              {toppings.length > 0 && (
                <fieldset className={styles["drink-details-toppings"]}>
                  <legend>Add toppings</legend>
                  {toppings.map((topping) => (
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
                disabled={isAdding || !drink.isAvailable}
              >
                {isAdding ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
          {cartError && (
            <p className={styles["drink-details-cart-error"]} role="alert">
              {cartError}
            </p>
          )}
          {cartMessage && (
            <p className={styles["drink-details-cart-message"]} role="status">
              {cartMessage}{" "}
              <button type="button" onClick={() => navigate("/order")}>
                View cart
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DrinkDetails;

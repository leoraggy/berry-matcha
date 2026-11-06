import { useEffect, useRef, useState } from "react";
import DrinkRepository from "../data/drinkRepository";
import "./styles/Order.css";

const drinkRepo = new DrinkRepository();
const MAX_DRINKS = 5;

function Order() {
  const [drinks, setDrinks] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [drinkPreferences, setDrinkPreferences] = useState({});
  const nextItemId = useRef(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;
    drinkRepo
      .getAllDrinks()
      .then((data) => {
        if (isCurrent) {
          setDrinks(data);
          setError(null);
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setError("Sorry, we couldn't load the menu. Please try again.");
          console.error(error);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const retryLoadingDrinks = () => {
    setLoading(true);
    setError(null);
    drinkRepo
      .getAllDrinks()
      .then(setDrinks)
      .catch((error) => {
        setError("Sorry, we couldn't load the menu. Please try again.");
        console.error(error);
      })
      .finally(() => setLoading(false));
  };

  const totalDrinks = orderItems.length;
  const totalPrice = orderItems.reduce((total, item) => {
    const drink = drinks.find(
      (availableDrink) => availableDrink._id === item.drinkId,
    );
    return total + (drink ? Number(drink.price) : 0);
  }, 0);

  const addDrink = (drinkId) => {
    const id = nextItemId.current++;
    const preferences = drinkPreferences[drinkId] ?? {
      sugar: "full",
      ice: "full",
    };

    setOrderItems((currentItems) => {
      if (currentItems.length >= MAX_DRINKS) {
        return currentItems;
      }

      return [
        ...currentItems,
        {
          id,
          drinkId,
          sugar: preferences.sugar,
          ice: preferences.ice,
        },
      ];
    });
  };

  const removeDrink = (itemId) => {
    setOrderItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  };

  const updatePreference = (drinkId, preference, value) => {
    setDrinkPreferences((currentPreferences) => ({
      ...currentPreferences,
      [drinkId]: {
        sugar: currentPreferences[drinkId]?.sugar ?? "full",
        ice: currentPreferences[drinkId]?.ice ?? "full",
        [preference]: value,
      },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (totalDrinks === 0) {
      setMessage("Please add at least one drink to your order.");
      return;
    }

    setMessage("Your order details are ready. Thank you!");
  };

  return (
    <div className="order-page">
      <div className="order-container">
        <title>Berry Matcha | Order</title>
        <header className="order-header">
          <h1>Place an order</h1>
        </header>
        {loading ? (
          <img
            src="/loading.gif"
            alt="Loading drinks..."
            className="loading"
            width={200}
          />
        ) : error ? (
          <div className="order-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="order-button"
              onClick={retryLoadingDrinks}
            >
              Try again
            </button>
          </div>
        ) : (
          <form
            className="order-form"
            onSubmit={handleSubmit}
            onChange={() => setMessage("")}
          >
            <section
              className="order-section"
              aria-labelledby="customer-heading"
            >
              <div className="customer-fields">
                <label>
                  First name
                  <input
                    type="text"
                    name="firstName"
                    autoComplete="given-name"
                    required
                  />
                </label>
                <label>
                  Last initial
                  <input
                    type="text"
                    name="lastInitial"
                    maxLength={1}
                    autoComplete="family-name"
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  Phone number
                  <input type="tel" name="phone" autoComplete="tel" required />
                </label>
              </div>
            </section>
            <section className="order-section" aria-labelledby="drinks-heading">
              <div className="order-section-heading">
                <div>
                  <h2 id="drinks-heading">Choose your drinks</h2>
                  <p>Add up to {MAX_DRINKS} drinks to your order.</p>
                </div>
                <span className="drink-limit" aria-live="polite">
                  {totalDrinks} / {MAX_DRINKS}
                </span>
              </div>
              {drinks.length === 0 ? (
                <p className="empty-menu">
                  There are no drinks available right now.
                </p>
              ) : (
                <div className="order-drink-list">
                  {drinks.map((drink) => {
                    const quantity = orderItems.filter(
                      (item) => item.drinkId === drink._id,
                    ).length;
                    const preferences = drinkPreferences[drink._id] ?? {
                      sugar: "full",
                      ice: "full",
                    };
                    return (
                      <article
                        className={`order-drink-card${quantity > 0 ? " is-selected" : ""}`}
                        key={drink._id}
                      >
                        <img src={drink.imageLink} alt={drink.name} />
                        <div className="order-drink-info">
                          <div className="order-drink-title">
                            <div>
                              <h3>{drink.name}</h3>
                              <p>{drink.category}</p>
                            </div>
                            <span>${Number(drink.price).toFixed(2)}</span>
                          </div>
                          <div className="drink-options">
                            <label>
                              Sugar
                              <select
                                value={preferences.sugar}
                                aria-label={`Sugar for ${drink.name} to add`}
                                onChange={(event) =>
                                  updatePreference(
                                    drink._id,
                                    "sugar",
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="full">Full</option>
                                <option value="half">Half</option>
                                <option value="zero">Zero</option>
                              </select>
                            </label>
                            <label>
                              Ice
                              <select
                                value={preferences.ice}
                                aria-label={`Ice for ${drink.name} to add`}
                                onChange={(event) =>
                                  updatePreference(
                                    drink._id,
                                    "ice",
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="full">Full</option>
                                <option value="less">Less</option>
                              </select>
                            </label>
                          </div>
                          <div className="drink-add-control">
                            {quantity > 0 && (
                              <span className="drink-count">
                                {quantity} in order
                              </span>
                            )}
                            <button
                              type="button"
                              className="add-drink-button"
                              onClick={() => addDrink(drink._id)}
                              disabled={totalDrinks >= MAX_DRINKS}
                            >
                              + Add drink
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
            <section
              className="order-summary"
              aria-labelledby="summary-heading"
            >
              <div>
                <h2 id="summary-heading">Order summary</h2>
                {orderItems.length === 0 ? (
                  <p className="summary-empty">
                    Your drinks will show up here.
                  </p>
                ) : (
                  <ul className="order-items">
                    {orderItems.map((item, index) => {
                      const drink = drinks.find(
                        (availableDrink) => availableDrink._id === item.drinkId,
                      );
                      if (!drink) {
                        return null;
                      }
                      return (
                        <li className="order-item" key={item.id}>
                          <div className="order-item-heading">
                            <span>
                              {index + 1}. {drink.name} · $
                              {Number(drink.price).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              className="remove-drink-button"
                              onClick={() => removeDrink(item.id)}
                              aria-label={`Remove ${drink.name} ${index + 1} from order`}
                            >
                              Remove
                            </button>
                          </div>
                          <p className="order-item-preferences">
                            Sugar: {item.sugar} · Ice: {item.ice}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div className="summary-total">
                <span>Estimated total</span>
                <strong>${totalPrice.toFixed(2)}</strong>
              </div>
              <button type="submit" className="order-button">
                Review order
              </button>
              <p className="order-message" aria-live="polite">
                {message}
              </p>
            </section>
          </form>
        )}
      </div>
    </div>
  );
}

export default Order;

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

  const matchaDrinks = drinks.filter((drink) => {
    return drink.category == "Matcha";
  });

  const teaDrinks = drinks.filter((drink) => {
    return drink.category == "Tea";
  });

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
  };

  return (
    <div className="order-page">
      <div className="order-container">
        <title>Berry Matcha | Order</title>
        <header className="order-header">
          <h1>Place an order</h1>
        </header>
        <form
          className="order-form"
          onSubmit={handleSubmit}
          onChange={() => setMessage("")}
        >
          <div className="order-section">
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
          </div>
          <div className="order-section">
            <div className="order-section-heading">
              <div>
                <h2 id="drinks-heading">Choose your drinks</h2>
                <p>Add up to {MAX_DRINKS} drinks to your order.</p>
              </div>
              <span className="drink-limit">
                {totalDrinks} / {MAX_DRINKS}
              </span>
            </div>
            <div class="line-container">
              <span class="line-text">Matcha</span>
            </div>
            <div className="order-drink-list">
              {matchaDrinks.map((drink) => {
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
                            onChange={(event) =>
                              updatePreference(
                                drink._id,
                                "ice",
                                event.target.value,
                              )
                            }
                          >
                            <option value="normal">Normal</option>
                            <option value="less">Less</option>
                          </select>
                        </label>
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
            <div class="line-container">
              <span class="line-text">Tea </span>
            </div>
            <div className="order-drink-list">
              {teaDrinks.map((drink) => {
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
                            onChange={(event) =>
                              updatePreference(
                                drink._id,
                                "ice",
                                event.target.value,
                              )
                            }
                          >
                            <option value="normal">Normal</option>
                            <option value="less">Less</option>
                          </select>
                        </label>
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
          </div>
        </form>
      </div>
    </div>
  );
}

export default Order;

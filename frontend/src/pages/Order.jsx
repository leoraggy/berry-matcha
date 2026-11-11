import { useEffect, useState, useCallback } from "react";
import DrinkRepository from "../data/drinkRepository";
import OrderRepository from "../data/orderRepository";
import styles from "./styles/Order.module.css";
import Loading from "../components/Loading";
import Error from "../components/Error";

function Order() {
  const drinkRepo = new DrinkRepository();
  const orderRepo = new OrderRepository();
  const MAX_DRINKS = 5;
  const [drinks, setDrinks] = useState([]);
  const [pickupHours, setPickupHours] = useState([]);
  const [drinkOptions, setDrinkOptions] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    customerEmail: "",
    totalPrice: "",
    pickupDate: "",
    pickupTime: "",
    drinks: [],
  });

  const matchaDrinks = drinks.filter((drink) => {
    return drink.category == "Matcha" && drink.isAvailable == true;
  });

  const teaDrinks = drinks.filter((drink) => {
    return drink.category == "Tea" && drink.isAvailable == true;
  });

  const fetchDrinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [drinkData, hoursResponse] = await Promise.all([
        drinkRepo.getAllDrinks(),
        fetch(`${import.meta.env.VITE_API_URL}/hours`),
      ]);
      const hoursData = await hoursResponse.json();
      if (!hoursResponse.ok) {
        throw new Error(hoursData.message || "Unable to load pickup hours.");
      }
      setDrinks(drinkData);
      setPickupHours(hoursData);
    } catch (error) {
      setError("Sorry, an error occured. Please try again. Matcha spilled.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrinks();
  }, [fetchDrinks]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error error={error} />;
  }

  const orderItems = formData.drinks;
  const totalDrinks = orderItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const totalPrice = orderItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const today = formatLocalDate(new Date());
  const dayLabels = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
  const selectedDate = formData.pickupDate
    ? new Date(`${formData.pickupDate}T00:00:00`)
    : null;
  const selectedDayHours = selectedDate
    ? pickupHours.find(
        (entry) => entry.dayOfTheWeek === dayLabels[selectedDate.getDay()],
      )?.hours
    : null;
  const pickupTimeOptions = [];
  if (selectedDayHours && selectedDayHours.toLowerCase() !== "closed") {
    for (const range of selectedDayHours.split(",")) {
      const match = range
        .trim()
        .match(
          /^(\d{1,2}):(\d{2})\s*(am|pm)\s*-\s*(\d{1,2}):(\d{2})\s*(am|pm)$/i,
        );
      if (!match) {
        continue;
      }
      const toMinutes = (hour, minute, meridiem) =>
        ((Number(hour) % 12) + (meridiem.toLowerCase() === "pm" ? 12 : 0)) *
          60 +
        Number(minute);
      const start = toMinutes(match[1], match[2], match[3]);
      const end = toMinutes(match[4], match[5], match[6]);
      for (let time = start; time < end; time += 30) {
        const hour24 = Math.floor(time / 60);
        const hour12 = hour24 % 12 || 12;
        const minute = String(time % 60).padStart(2, "0");
        const meridiem = hour24 < 12 ? "AM" : "PM";
        const value = `${String(hour24).padStart(2, "0")}:${minute}`;
        if (
          formData.pickupDate !== today ||
          time > new Date().getHours() * 60 + new Date().getMinutes()
        ) {
          pickupTimeOptions.push({
            value,
            label: `${hour12}:${minute} ${meridiem}`,
          });
        }
      }
    }
  }

  const updateDrinkOption = (drinkId, option, value) => {
    setDrinkOptions((currentOptions) => ({
      ...currentOptions,
      [drinkId]: {
        sugar: "Full",
        ice: "Normal",
        ...currentOptions[drinkId],
        [option]: value,
      },
    }));
  };

  const addDrinkToList = (drink) => {
    const options = drinkOptions[drink._id] ?? {
      sugar: "Full",
      ice: "Normal",
    };

    setFormData((currentData) => ({
      ...currentData,
      drinks: [
        ...currentData.drinks,
        {
          drinkId: drink._id,
          name: drink.name,
          price: Number(drink.price),
          quantity: 1,
          sugar: options.sugar,
          ice: options.ice,
        },
      ],
    }));
  };

  const removeDrinkFromList = (indexToRemove) => {
    setFormData((currentData) => ({
      ...currentData,
      drinks: currentData.drinks.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const submittedFields = new FormData(event.currentTarget);
    const order = {
      customerName:
        `${submittedFields.get("firstName")} ${submittedFields.get("lastName")}`.trim(),
      phoneNumber: submittedFields.get("phone"),
      customerEmail: submittedFields.get("email"),
      totalPrice: Number(totalPrice.toFixed(2)),
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      drinks: orderItems,
    };

    console.log(order);
  };

  return (
    <div className={styles["order-page"]}>
      <div className={styles["order-container"]}>
        <title>Berry Matcha | Order</title>
        <div
          className={`${styles["order-section"]} ${styles["big-order-section"]}`}
          id="big-order-section"
        >
          <header className={styles["order-header"]}>
            <h1 id="order-header">Place Order</h1>
          </header>
          <form className={styles["order-form"]} onSubmit={handleSubmit}>
            <div className={styles["order-section"]}>
              <div className={styles["customer-fields"]}>
                <label>
                  First name
                  <input type="text" name="firstName" required />
                </label>
                <label>
                  Last name
                  <input type="text" name="lastName" required />
                </label>
                <label>
                  Email
                  <input type="email" name="email" required />
                </label>
                <label>
                  Phone number
                  <input type="tel" name="phone" required />
                </label>
              </div>
            </div>
            <div className={styles["order-section"]}>
              <div className={styles["order-section-heading"]}>
                <div>
                  <h2>Pickup details</h2>
                  <p>Choose a date and an available time slot.</p>
                </div>
              </div>
              <div className={styles["pickup-fields"]}>
                <label>
                  Pickup date
                  <input
                    type="date"
                    name="pickupDate"
                    min={today}
                    required
                    value={formData.pickupDate}
                    onChange={(event) =>
                      setFormData((currentData) => ({
                        ...currentData,
                        pickupDate: event.target.value,
                        pickupTime: "",
                      }))
                    }
                  />
                </label>
                <label>
                  Pickup time
                  <select
                    name="pickupTime"
                    required
                    value={formData.pickupTime}
                    disabled={
                      !formData.pickupDate || pickupTimeOptions.length === 0
                    }
                    onChange={(event) =>
                      setFormData((currentData) => ({
                        ...currentData,
                        pickupTime: event.target.value,
                      }))
                    }
                  >
                    <option value="">
                      {!formData.pickupDate
                        ? "Select a date first"
                        : pickupTimeOptions.length
                          ? "Select a pickup time"
                          : "No pickup times available"}
                    </option>
                    {pickupTimeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className={styles["order-section"]}>
              <div className={styles["order-section-heading"]}>
                <div>
                  <h2 id="drinks-heading">Choose your drinks</h2>
                  <p>Add up to {MAX_DRINKS} drinks to your order.</p>
                </div>
                <span className={styles["drink-limit"]}>
                  {totalDrinks} / {MAX_DRINKS}
                </span>
              </div>
              <div className={styles["line-container"]}>
                <span className={styles["line-text"]}>Matcha</span>
              </div>
              <div className={styles["order-drink-list"]}>
                {matchaDrinks.map((drink) => {
                  const addedQuantity = orderItems
                    .filter((item) => item.drinkId === drink._id)
                    .reduce((total, item) => total + item.quantity, 0);
                  const options = drinkOptions[drink._id] ?? {
                    sugar: "Full",
                    ice: "Normal",
                  };
                  return (
                    <article
                      className={`${styles["order-drink-card"]}${addedQuantity > 0 ? ` ${styles["is-selected"]}` : ""}`}
                      key={drink._id}
                    >
                      <img src={drink.imageLink} alt={drink.name} />
                      <div className={styles["order-drink-info"]}>
                        <div className={styles["order-drink-title"]}>
                          <div>
                            <h3>{drink.name}</h3>
                            <p>{drink.category}</p>
                          </div>
                          <span>${Number(drink.price).toFixed(2)}</span>
                        </div>
                        <div className={styles["drink-options"]}>
                          <div className={styles["drink-options-1"]}>
                            <label>
                              Sugar
                              <select
                                value={options.sugar}
                                onChange={(event) =>
                                  updateDrinkOption(
                                    drink._id,
                                    "sugar",
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="Full">Full</option>
                                <option value="Half">Half</option>
                                <option value="Zero">Zero</option>
                              </select>
                            </label>
                            <label>
                              Ice
                              <select
                                value={options.ice}
                                onChange={(event) =>
                                  updateDrinkOption(
                                    drink._id,
                                    "ice",
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="Normal">Normal</option>
                                <option value="Less">Less</option>
                                <option value="No">No</option>
                              </select>
                            </label>
                          </div>
                          <button
                            type="button"
                            className={styles["add-drink-button"]}
                            onClick={() => addDrinkToList(drink)}
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
              <div className={styles["line-container"]}>
                <span className={styles["line-text"]}>Tea</span>
              </div>
              <div className={styles["order-drink-list"]}>
                {teaDrinks.map((drink) => {
                  const addedQuantity = orderItems
                    .filter((item) => item.drinkId === drink._id)
                    .reduce((total, item) => total + item.quantity, 0);
                  const options = drinkOptions[drink._id] ?? {
                    sugar: "Full",
                    ice: "Normal",
                  };
                  return (
                    <article
                      className={`${styles["order-drink-card"]}${addedQuantity > 0 ? ` ${styles["is-selected"]}` : ""}`}
                      key={drink._id}
                    >
                      <img src={drink.imageLink} alt={drink.name} />
                      <div className={styles["order-drink-info"]}>
                        <div className={styles["order-drink-title"]}>
                          <div>
                            <h3>{drink.name}</h3>
                            <p>{drink.category}</p>
                          </div>
                          <span>${Number(drink.price).toFixed(2)}</span>
                        </div>
                        <div className={styles["drink-options"]}>
                          <div className={styles["drink-options-1"]}>
                            <label>
                              Sugar
                              <select
                                value={options.sugar}
                                onChange={(event) =>
                                  updateDrinkOption(
                                    drink._id,
                                    "sugar",
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="Full">Full</option>
                                <option value="Half">Half</option>
                                <option value="Zero">Zero</option>
                              </select>
                            </label>
                            <label>
                              Ice
                              <select
                                value={options.ice}
                                onChange={(event) =>
                                  updateDrinkOption(
                                    drink._id,
                                    "ice",
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="Normal">Normal</option>
                                <option value="Less">Less</option>
                                <option value="No">No</option>
                              </select>
                            </label>
                          </div>
                          <button
                            type="button"
                            className={styles["add-drink-button"]}
                            onClick={() => addDrinkToList(drink)}
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
            <div className={styles["order-section"]}>
              <div className={styles["order-section-heading"]}>
                <div>
                  <h2 id="drinks-heading">Order Summary</h2>
                </div>
              </div>
              {orderItems.length > 0 ? (
                <>
                  {orderItems.map((item, index) => (
                    <div
                      className={styles["order-item"]}
                      key={`${item.drinkId}-${index}`}
                    >
                      <div className={`${styles["drink-list-flex"]} ${styles["order-item-heading"]}`}>
                        <p>
                          {item.quantity} × {item.name}
                        </p>
                        <div className={styles["drink-list-actions"]}>
                          <p>${(item.price * item.quantity).toFixed(2)}</p>
                          <button
                            type="button"
                            className={styles["remove-drink-button"]}
                            onClick={() => removeDrinkFromList(index)}
                            aria-label={`Remove ${item.name} from order`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <ul className={styles["order-item-preferences"]}>
                        <li>{item.sugar} sugar</li>
                        <li>{item.ice} ice</li>
                      </ul>
                    </div>
                  ))}
                  <p className={styles["order-summary-total"]}>
                    Total <strong>${totalPrice.toFixed(2)}</strong>
                  </p>
                  <div className={styles["order-button-container"]}>
                    <button
                      type="submit"
                      className={styles["order-button"]}
                      disabled={orderItems.length === 0}
                    >
                      Submit order
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>No drinks selected.</p>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Order;

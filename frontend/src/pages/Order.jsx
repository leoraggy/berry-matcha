import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./styles/Order.module.css";
import Loading from "../components/Loading";
import Error from "../components/Error";
import OrderSummary from "../components/OrderSummary";
import { createCheckoutSession } from "../data/checkoutService";
import { getCart, removeCartItem } from "../data/cartService";

const dayLabels = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getPickupTimeOptions = (dateValue, location, now) => {
  if (!dateValue || !Array.isArray(location?.hours)) {
    return [];
  }

  const date = new Date(`${dateValue}T00:00:00`);
  const dayHours = location.hours.find(
    (entry) => entry.dayOfTheWeek === dayLabels[date.getDay()],
  )?.hours;
  if (typeof dayHours !== "string" || dayHours.toLowerCase() === "closed") {
    return [];
  }

  const isToday = dateValue === formatLocalDate(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const options = [];
  for (const range of dayHours.split(",")) {
    const match = range
      .trim()
      .match(
        /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i,
      );
    if (!match) {
      continue;
    }

    const toMinutes = (hour, minute, meridiem) =>
      ((Number(hour) % 12) + (meridiem.toLowerCase() === "pm" ? 12 : 0)) * 60 +
      Number(minute ?? 0);
    const start = toMinutes(match[1], match[2], match[3]);
    const end = toMinutes(match[4], match[5], match[6]);
    for (let time = start; time < end; time += 30) {
      if (isToday && time <= currentMinutes) {
        continue;
      }

      const hour24 = Math.floor(time / 60);
      const hour12 = hour24 % 12 || 12;
      const minute = String(time % 60).padStart(2, "0");
      const meridiem = hour24 < 12 ? "AM" : "PM";
      options.push({
        value: `${String(hour24).padStart(2, "0")}:${minute}`,
        label: `${hour12}:${minute} ${meridiem}`,
      });
    }
  }

  return options;
};

function Order() {
  const [cart, setCart] = useState({
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
  });
  const [pickupLocations, setPickupLocations] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutError, setCheckoutError] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [formData, setFormData] = useState({
    pickupDate: "",
    pickupTime: "",
    location: "",
  });

  useEffect(() => {
    let active = true;

    const loadOrderData = async () => {
      try {
        const [hoursResponse, cartData] = await Promise.all([
          fetch("/api/hours"),
          getCart(),
        ]);
        const hoursData = await hoursResponse.json();
        if (!hoursResponse.ok) {
          throw new Error(hoursData.message || "Unable to load pickup hours.");
        }
        if (!Array.isArray(hoursData)) {
          throw new Error("Pickup hours response was not a list of locations.");
        }

        if (active) {
          setCart(cartData);
          setPickupLocations(hoursData);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load your order.");
          console.error("Unable to load order data:", requestError);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOrderData();
    return () => {
      active = false;
    };
  }, []);

  const orderItems = cart.items;

  const now = new Date();
  const selectedLocation = pickupLocations.find(
    (location) => location.name === formData.location,
  );
  const minDaysAhead =
    selectedLocation?.name === "Southcenter Macy's Court" ? 4 : 0;
  const maxDaysAhead = 14;
  const pickupDates = [];
  if (selectedLocation) {
    for (
      let daysAhead = minDaysAhead;
      daysAhead <= maxDaysAhead;
      daysAhead += 1
    ) {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + daysAhead);
      const value = formatLocalDate(date);
      if (getPickupTimeOptions(value, selectedLocation, now).length > 0) {
        pickupDates.push({
          value,
          label: new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          }).format(date),
        });
      }
    }
  }
  const pickupTimeOptions = getPickupTimeOptions(
    formData.pickupDate,
    selectedLocation,
    now,
  );

  const removeDrinkFromList = async (cartItemId) => {
    setCheckoutError(null);
    setRemovingItemId(cartItemId);
    try {
      setCart(await removeCartItem(cartItemId));
    } catch (removeError) {
      setCheckoutError(removeError.message || "Unable to remove this drink.");
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isCheckingOut || orderItems.length === 0) {
      return;
    }

    const submittedFields = new FormData(event.currentTarget);
    const order = {
      name: submittedFields.get("name")?.toString().trim(),
      phone: submittedFields.get("phone")?.toString().trim(),
      email: submittedFields.get("email")?.toString().trim(),
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      location: formData.location,
    };

    setCheckoutError(null);
    setIsCheckingOut(true);
    try {
      const session = await createCheckoutSession(order);
      window.location.assign(session.url);
    } catch (checkoutRequestError) {
      console.error("Checkout failed:", checkoutRequestError);
      setCheckoutError(
        checkoutRequestError.message ||
          "Unable to start checkout. Please try again.",
      );
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error error={error} />;
  }

  const hasUnavailableItems = orderItems.some(
    (item) => !item.isAvailable || item.hasUnavailableToppings,
  );

  return (
    <div className={styles["order-page"]}>
      <title>Berry Matcha | Order</title>
      <div className={styles["order-container"]}>
        <div
          className={`${styles["order-section"]} ${styles["big-order-section"]}`}
        >
          <h1 className={styles.orderHeader}>Place Order</h1>
          <form className={styles["order-form"]} onSubmit={handleSubmit}>
            <div className={styles["order-section"]}>
              <div className={styles["customer-fields"]}>
                <label>
                  Name
                  <input type="text" name="name" required />
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
                  <p>
                    Available pickup times depend on the selected location and
                    date.
                  </p>
                </div>
              </div>
              <div className={styles["pickup-fields"]}>
                <label>
                  Pickup location
                  <select
                    name="location"
                    required
                    value={formData.location}
                    onChange={(event) =>
                      setFormData((currentData) => ({
                        ...currentData,
                        location: event.target.value,
                        pickupDate: "",
                        pickupTime: "",
                      }))
                    }
                  >
                    <option value="">Select a pickup location</option>
                    {pickupLocations.map((location) => (
                      <option key={location.name} value={location.name}>
                        {location.address
                          ? `${location.name} - ${location.address}`
                          : location.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Pickup date
                  <select
                    name="pickupDate"
                    required
                    value={formData.pickupDate}
                    disabled={!selectedLocation}
                    onChange={(event) =>
                      setFormData((currentData) => ({
                        ...currentData,
                        pickupDate: event.target.value,
                        pickupTime: "",
                      }))
                    }
                  >
                    <option value="">
                      {!selectedLocation
                        ? "Select a location first"
                        : pickupDates.length
                          ? "Select an available date"
                          : "No available dates in the next 2 weeks"}
                    </option>
                    {pickupDates.map((date) => (
                      <option key={date.value} value={date.value}>
                        {date.label}
                      </option>
                    ))}
                  </select>
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
                  <h2>Order Summary</h2>
                  <p>
                    Add drinks from their detail pages.{" "}
                    <Link to="/menu">Browse the menu</Link>
                  </p>
                </div>
                <span className={styles["drink-limit"]}>
                  {cart.totalQuantity} / 5
                </span>
              </div>
              <OrderSummary
                orderItems={orderItems}
                totalPrice={cart.totalPrice}
                removeDrinkFromList={removeDrinkFromList}
                removingItemId={removingItemId}
                checkoutError={checkoutError}
                isCheckingOut={isCheckingOut}
                hasUnavailableItems={hasUnavailableItems}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Order;

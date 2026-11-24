import { useSearchParams } from "react-router-dom";
import styles from "./styles/Success.module.css";
import { useState, useEffect } from "react";
import Loading from "../components/Loading";
import Error from "../components/Error";
import { getOrderDetails } from "../data/checkoutService";
import { formatOrderDate } from "../data/cartService";

function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async (cancelled) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderDetails(sessionId);
      setOrder(data.order);
    } catch (error) {
      if (!cancelled) {
        setError(error.message || "Unable to retrieve your order details.");
        console.error(error);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetchOrder(cancelled);
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error error={error} />;
  }

  return (
    <div className={styles.background}>
      <div className={styles.successContainer}>
        <h1 className={styles.orderTitle}>Your Order is Confirmed</h1>
        <h1 className={styles.berryMatcha}>Thank you Berry Matcha!</h1>
        <p>Order #{order?._id}</p>
        <p>Order Placed: {order.createdAt}</p>
        <h2>Customer Details</h2>
        <hr />
        <p>Name: {order.name}</p>
        <p>Email: {order.email}</p>
        <p>Phone Number: {order.phone}</p>
        <p>
          Pickup Date: {formatOrderDate(order.pickupDate)} at
          {order.pickupTime}
        </p>
        <p>Pickup Location: {order.location}</p>
        <h2>Order Summary</h2>
        <hr />
        {order.drinks.map((drink, index) => (
          <div key={`${drink.drinkId}-${index}`} className={styles.receiptItem}>
            <div className={styles.drinkHeader}>
              <span>
                {drink.quantity > 1 && <span>{drink.quantity}x </span>}
                {drink.name}
              </span>
              <span>${Number(drink.price).toFixed(2)}</span>
            </div>

            <div className={styles.drinkModifiers}>
              <p className={styles.modifierLine}>- {drink.sugar} Sugar</p>
              <p className={styles.modifierLine}>- {drink.ice} Ice</p>
              {drink.toppings.length > 0 && (
                <p className={styles.modifierLine}>
                  -{" "}
                  {Array.isArray(drink.toppings)
                    ? drink.toppings.join(", ")
                    : drink.toppings}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Success;

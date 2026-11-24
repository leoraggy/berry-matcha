import styles from "../pages/styles/Order.module.css";

function OrderSummary({
  orderItems,
  totalPrice,
  removeDrinkFromList,
  removingItemId,
  checkoutError,
  isCheckingOut,
  hasUnavailableItems,
}) {
  return (
    <>
      {orderItems.length > 0 ? (
        <>
          {orderItems.map((item) => (
            <div className={styles["order-item"]} key={item.cartItemId}>
              <div
                className={`${styles["drink-list-flex"]} ${styles["order-item-heading"]}`}
              >
                <p>
                  {item.quantity} × {item.name}
                  {!item.isAvailable && " (unavailable)"}
                </p>
                <div className={styles["drink-list-actions"]}>
                  <p>
                    {item.price === null
                      ? "—"
                      : `$${(item.price * item.quantity).toFixed(2)}`}
                  </p>
                  <button
                    type="button"
                    className={styles["remove-drink-button"]}
                    disabled={
                      removingItemId === item.cartItemId || isCheckingOut
                    }
                    onClick={() => removeDrinkFromList(item.cartItemId)}
                  >
                    {removingItemId === item.cartItemId
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              </div>
              <ul className={styles["order-item-preferences"]}>
                <li>{item.sugar} sugar</li>
                <li>{item.ice} ice</li>
                {item.toppings?.map((topping) => (
                  <li key={topping}>{topping}</li>
                ))}
                {item.hasUnavailableToppings && (
                  <li>One or more toppings are unavailable. Remove this drink and add it again.</li>
                )}
              </ul>
            </div>
          ))}
          <p className={styles["order-summary-total"]}>
            Total <strong>${totalPrice.toFixed(2)}</strong>
          </p>
          <div className={styles["order-button-container"]}>
            {checkoutError && <p role="alert">{checkoutError}</p>}
            <button
              type="submit"
              className={styles["order-button"]}
              disabled={
                orderItems.length === 0 ||
                hasUnavailableItems ||
                isCheckingOut ||
                Boolean(removingItemId)
              }
            >
              {isCheckingOut ? "Redirecting to checkout..." : "Checkout"}
            </button>
          </div>
        </>
      ) : (
        <>
          <p>No drinks selected.</p>
        </>
      )}
    </>
  );
}

export default OrderSummary;

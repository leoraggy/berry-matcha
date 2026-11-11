import styles from "../pages/styles/Order.module.css";

function OrderSummary({ orderItems, totalPrice, removeDrinkFromList }) {
  return (
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
              <div
                className={`${styles["drink-list-flex"]} ${styles["order-item-heading"]}`}
              >
                <p>
                  {item.quantity} × {item.name}
                </p>
                <div className={styles["drink-list-actions"]}>
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    type="button"
                    className={styles["remove-drink-button"]}
                    onClick={() => removeDrinkFromList(index)}
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
  );
}

export default OrderSummary;

import styles from "./Admin.module.css";

function AdminDrinkList({ drinks, drinkSales, deletingId, onEdit, onDelete }) {
  const categories = [
    ...new Set(["Matcha", "Tea", ...drinks.map((drink) => drink.category)]),
  ];

  return categories.map((category) => {
    const categoryDrinks = drinks.filter(
      (drink) => drink.category === category,
    );

    return (
      <section className={styles["admin-menu-section"]} key={category}>
        <div className={styles["line-container"]}>
          <span className={styles["line-text"]}>{category}</span>
        </div>
        {categoryDrinks.length > 0 ? (
          <div className={styles["admin-drink-list"]}>
            {categoryDrinks.map((drink) => (
              <article
                className={`${styles["admin-drink-card"]}${drink.isAvailable === false ? ` ${styles["is-unavailable"]}` : ""}`}
                key={drink._id}
              >
                {drink.imageLink ? (
                  <img src={drink.imageLink} alt={drink.name} />
                ) : (
                  <div className={styles["admin-image-placeholder"]}>
                    Berry Matcha
                  </div>
                )}
                <div className={styles["admin-drink-card-content"]}>
                  <div className={styles["admin-drink-card-title"]}>
                    <h3>{drink.name}</h3>
                    <span>${Number(drink.price).toFixed(2)}</span>
                  </div>
                  <p className={styles["admin-drink-status"]}>
                    {drink.isAvailable === false ? "Unavailable" : "Available"}
                  </p>
                  <p className={styles["admin-drink-sales"]}>
                    {drinkSales.find((sale) => sale._id === drink._id)
                      ?.quantitySold ?? 0}{" "}
                    sold
                  </p>
                  <div className={styles["admin-button-panel"]}>
                    <button
                      type="button"
                      className={styles["admin-edit-button"]}
                      onClick={() => onEdit(drink)}
                    >
                      Edit drink
                    </button>
                    <button
                      type="button"
                      className={styles["admin-delete-button"]}
                      onClick={() => onDelete(drink)}
                      disabled={deletingId !== null}
                    >
                      {deletingId === drink._id
                        ? "Deleting..."
                        : "Delete drink"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles["admin-empty"]}>
            No drinks in this category yet.
          </p>
        )}
      </section>
    );
  });
}

export default AdminDrinkList;

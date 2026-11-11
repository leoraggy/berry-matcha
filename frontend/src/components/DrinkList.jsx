import styles from "./styles/DrinkList.module.css";

import { Link } from "react-router-dom";
function DrinkList({ drinks }) {
  const matchaDrinks = drinks.filter((drink) => {
    return drink.category == "Matcha" && drink.isAvailable == true;
  });

  const teaDrinks = drinks.filter((drink) => {
    return drink.category == "Tea" && drink.isAvailable == true;
  });
  return (
    <div className={styles.drinkContainer}>
      <div className={styles.lineContainer}>
        <span className={styles.lineText}>Matcha</span>
      </div>
      <div className={styles.drinkList}>
        {matchaDrinks.map((drink) => (
          <div className={styles.drinkCard} key={drink._id}>
            <img src={drink.imageLink} alt="img of drink" />

            <h4 className={styles.drinkName}>{drink.name}</h4>
            <div className={styles.priceDetails}>
              <p>${drink.price.toFixed(2)}</p>
              <Link className={styles.viewDetails} to={`/menu/${drink._id}`}>
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
      <br />
      <div className={styles.lineContainer}>
        <span className={styles.lineText}>Tea</span>
      </div>
      <div className={styles.drinkList}>
        {teaDrinks.map((drink) => (
          <div className={styles.drinkCard} key={drink._id}>
            <img src={drink.imageLink} alt="img of drink" />

            <h4 className={styles.drinkName}>{drink.name}</h4>
            <div className={styles.priceDetails}>
              <p>${drink.price.toFixed(2)}</p>
              <Link className={styles.viewDetails} to={`/menu/${drink._id}`}>
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DrinkList;

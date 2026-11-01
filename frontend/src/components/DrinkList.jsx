import "./styles/DrinkList.css";
import { Link } from "react-router-dom";
function DrinkList({ drinks }) {
  const matchaDrinks = drinks.filter((drink) => {
    return drink.category == "Matcha";
  });

  const teaDrinks = drinks.filter((drink) => {
    return drink.category == "Tea";
  });
  return (
    <div className="drink-container">
      <div class="line-container">
        <span class="line-text">Matcha</span>
      </div>
      <div className="drink-list">
        {matchaDrinks.map((drink) => (
          <div className="drink-card" key={drink._id}>
            <img src="/boba.jpg" alt="img of drink" />

            <h4 className="drink-name">{drink.name}</h4>
            <div className="price-details">
              <p>${drink.price.toFixed(2)}</p>
              <Link className="view-details" to={`/menu/${drink.name}`}>
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
      <br />
      <div class="line-container">
        <span class="line-text">Tea</span>
      </div>
      <div className="drink-list">
        {teaDrinks.map((drink) => (
          <div className="drink-card" key={drink._id}>
            <img src="/boba.jpg" alt="img of drink" />

            <h4 className="drink-name">{drink.name}</h4>
            <div className="price-details">
              <p>${drink.price.toFixed(2)}</p>
              <Link className="view-details" to={`/menu/${drink._id}`}>
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

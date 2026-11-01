import DrinkRepository from "../data/drinkRepository";
import { useCallback, useEffect, useState } from "react";
import DrinkList from "../components/DrinkList";
import "/loading.gif";
import "./styles/Menu.css";
import "/error.png";
const drinkRepo = new DrinkRepository();

function Menu() {
  const [drinks, setDrinks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDrinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await drinkRepo.getAllDrinks();
      setDrinks(data);
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
    return (
      <img src="loading.gif" alt="loading..." className="loading" width={200} />
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>{error}</h3>
        <img src="error.png" alt="error image" width={200} id="error-image" />
      </div>
    );
  }

  return (
    <>
      <title>Berry Matcha | Menu</title>
      <DrinkList
        drinks={drinks}
        loading={loading}
        error={error}
        onRetry={fetchDrinks}
      />
    </>
  );
}

export default Menu;

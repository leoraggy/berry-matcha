import DrinkRepository from "../data/drinkRepository";
import { useCallback, useEffect, useState } from "react";
import DrinkList from "../components/DrinkList";
import Loading from "../components/Loading";
import Error from "../components/Error";

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
    return <Loading />;
  }

  if (error) {
    return <Error error={error} />;
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

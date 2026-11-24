import DrinkRepository from "../data/drinkRepository";
import ToppingRepository from "../data/toppingRepository";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DrinkDetails from "../components/DrinkDetails";
import Loading from "../components/Loading";
import Error from "../components/Error";

const drinkRepo = new DrinkRepository();
const toppingRepo = new ToppingRepository();

function MenuItem() {
  const { id } = useParams();
  const [drink, setDrink] = useState(null);
  const [toppings, setToppings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setDrink(null);

      try {
        const [drinkData, toppingData] = await Promise.all([
          drinkRepo.getDrinkById(id),
          toppingRepo.getAllToppings(),
        ]);
        if (active) {
          setDrink(drinkData);
          setToppings(toppingData);
        }
      } catch (error) {
        if (active) {
          setError(
            "Sorry, an error occurred. Please try again. Matcha spilled.",
          );
          console.error(error);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error error={error} />;
  }

  if (!drink) {
    return <Error error="Drink not found." />;
  }

  return (
    <>
      <title>Berry Matcha | Menu</title>
      <DrinkDetails drink={drink} toppings={toppings} />
    </>
  );
}

export default MenuItem;

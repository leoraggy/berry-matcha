import Drink from "../model/drink.js";

export const getAllDrinks = async (req, res) => {
  try {
    const drinks = await Drink.find();

    if (!drinks) {
      res.status(404).json({ message: "No drinks found." });
    }

    res.json(drinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDrinkById = async (req, res) => {
  try {
    const drink = await Drink.findById(req.params.id);
    if (!drink) {
      res.status(404).json({ message: "Drink not found." });
    }
    res.json(drink);
  } catch (error) {}
};

export const createDrink = async (req, res) => {
  try {
    const drink = new Drink(req.body);
    const newDrink = await drink.save();
    res.status(201).json(newDrink);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

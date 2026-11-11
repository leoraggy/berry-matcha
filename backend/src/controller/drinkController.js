import Drink from "../model/drink.js";
import Order from "../model/order.js";

export const getDrinkSales = async (req, res) => {
  try {
    const sales = await Drink.aggregate([
      {
        $lookup: {
          from: Order.collection.name,
          let: { drinkId: "$_id" },
          pipeline: [
            { $unwind: "$drinks" },
            {
              $match: {
                $expr: { $eq: ["$drinks.drinkId", "$$drinkId"] },
              },
            },
            {
              $group: {
                _id: null,
                quantitySold: { $sum: "$drinks.quantity" },
              },
            },
          ],
          as: "sales",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          price: 1,
          quantitySold: {
            $ifNull: [{ $arrayElemAt: ["$sales.quantitySold", 0] }, 0],
          },
        },
      },
    ]);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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

export const updateDrink = async (req, res) => {
  try {
    const drink = await Drink.findByIdAndUpdate(req.params.id, req.body);
    res.json(drink);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDrink = async (req, res) => {
  try {
    await Drink.findByIdAndDelete(req.params.id);
    res.json({ message: "Drink successfully deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

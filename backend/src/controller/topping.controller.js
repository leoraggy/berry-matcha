import Topping from "../model/topping.model.js";

export const getAllToppings = async (req, res, next) => {
  try {
    const toppings = await Topping.find({ isAvailable: true }).sort({ name: 1 });
    res.json(toppings);
  } catch (error) {
    next(error);
  }
};

export const getToppingById = async (req, res, next) => {
  try {
    const topping = await Topping.findById(req.params.id);
    if (!topping) {
      return res.status(404).json({ message: "Topping not found." });
    }
    res.json(topping);
  } catch (error) {
    next(error);
  }
};

export const createTopping = async (req, res, next) => {
  try {
    const topping = new Topping(req.body);
    const newTopping = await topping.save();
    res.status(201).json(newTopping);
  } catch (error) {
    next(error);
  }
};

export const updateTopping = async (req, res, next) => {
  try {
    const topping = await Topping.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!topping) {
      return res.status(404).json({ message: "Topping not found." });
    }
    res.json(topping);
  } catch (error) {
    next(error);
  }
};

export const deleteTopping = async (req, res, next) => {
  try {
    const topping = await Topping.findByIdAndDelete(req.params.id);
    if (!topping) {
      return res.status(404).json({ message: "Topping not found." });
    }
    res.json({ message: "Topping successfully deleted" });
  } catch (error) {
    next(error);
  }
};

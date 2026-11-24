import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import Drink from "../model/drink.model.js";
import Topping from "../model/topping.model.js";

const MAX_CART_QUANTITY = 5;
const SUGAR_OPTIONS = new Set(["Full", "Half", "Zero"]);
const ICE_OPTIONS = new Set(["Normal", "Less", "No"]);

export const getCart = async (req, res, next) => {
  try {
    req.session.cart ??= [];
    const cart = await getCartDetails(req.session.cart);
    await saveSession(req);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

export const addCartItem = async (req, res, next) => {
  try {
    const {
      drinkId,
      quantity = 1,
      sugar = "Full",
      ice = "Normal",
      toppings = [],
    } = req.body ?? {};

    if (
      typeof drinkId !== "string" ||
      !mongoose.isObjectIdOrHexString(drinkId) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      !SUGAR_OPTIONS.has(sugar) ||
      !ICE_OPTIONS.has(ice) ||
      !Array.isArray(toppings) ||
      toppings.length > 5 ||
      toppings.some(
        (toppingId) =>
          typeof toppingId !== "string" ||
          !mongoose.isObjectIdOrHexString(toppingId),
      )
    ) {
      return res.status(400).json({ error: "Invalid cart item." });
    }

    const drink = await Drink.findById(drinkId);
    if (!drink || !drink.isAvailable) {
      return res.status(404).json({ error: "Drink is unavailable." });
    }

    const selectedToppings = await Topping.find({
      _id: { $in: toppings },
      isAvailable: true,
    });
    if (selectedToppings.length !== new Set(toppings).size) {
      return res.status(400).json({
        error: "One or more selected toppings are unavailable.",
      });
    }

    req.session.cart ??= [];
    const currentQuantity = req.session.cart.reduce(
      (total, item) => total + item.quantity,
      0,
    );
    if (currentQuantity + quantity > MAX_CART_QUANTITY) {
      return res.status(400).json({
        error: `Cart cannot contain more than ${MAX_CART_QUANTITY} drinks.`,
      });
    }

    const normalizedToppings = selectedToppings
      .map((topping) => topping._id.toString())
      .sort();
    const existingItem = req.session.cart.find(
      (item) =>
        item.drinkId === drink._id.toString() &&
        item.sugar === sugar &&
        item.ice === ice &&
        JSON.stringify(item.toppingIds ?? []) ===
          JSON.stringify(normalizedToppings),
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      req.session.cart.push({
        cartItemId: randomUUID(),
        drinkId: drink._id.toString(),
        quantity,
        sugar,
        ice,
        toppingIds: normalizedToppings,
      });
    }

    await saveSession(req);
    res.status(201).json(await getCartDetails(req.session.cart));
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    req.session.cart ??= [];
    const itemIndex = req.session.cart.findIndex(
      (item) => item.cartItemId === req.params.cartItemId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Cart item not found." });
    }

    req.session.cart.splice(itemIndex, 1);
    await saveSession(req);
    res.json(await getCartDetails(req.session.cart));
  } catch (error) {
    next(error);
  }
};

const getCartDetails = async (items) => {
  if (items.length === 0) {
    return { items: [], totalQuantity: 0, totalPrice: 0 };
  }

  const drinks = await Drink.find({
    _id: { $in: items.map((item) => item.drinkId) },
  });
  const toppingIds = items.flatMap((item) => item.toppingIds ?? []);
  const toppings = await Topping.find({ _id: { $in: toppingIds } });
  const drinksById = new Map(
    drinks.map((drink) => [drink._id.toString(), drink]),
  );
  const toppingsById = new Map(
    toppings.map((topping) => [topping._id.toString(), topping]),
  );
  const cartItems = items.map((item) => {
    const drink = drinksById.get(item.drinkId);
    return {
      ...item,
      name: drink?.name ?? "Unavailable drink",
      price: drink?.price ?? null,
      isAvailable: Boolean(drink?.isAvailable),
      toppings: (item.toppingIds ?? []).map(
        (toppingId) =>
          toppingsById.get(toppingId)?.name ?? "Unavailable topping",
      ),
      hasUnavailableToppings: (item.toppingIds ?? []).some(
        (toppingId) => !toppingsById.get(toppingId)?.isAvailable,
      ),
    };
  });

  return {
    items: cartItems,
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: cartItems.reduce(
      (total, item) =>
        item.isAvailable ? total + item.price * item.quantity : total,
      0,
    ),
  };
};

const saveSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

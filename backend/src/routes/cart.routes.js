import { Router } from "express";
import {
  addCartItem,
  getCart,
  removeCartItem,
} from "../controller/cart.controller.js";

const router = Router();

router.get("/", getCart);
router.post("/items", addCartItem);
router.delete("/items/:cartItemId", removeCartItem);

export default router;

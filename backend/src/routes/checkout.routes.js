import { Router } from "express";
import {
  postCheckout,
  getOrderDetails,
} from "../controller/checkout.controller.js";

const router = Router();

router.post("/create-checkout-session", postCheckout);
router.get("/order-details", getOrderDetails);

export default router;

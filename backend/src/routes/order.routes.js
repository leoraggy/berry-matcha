import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
} from "../controller/order.controller.js";
import { routeGuard } from "../controller/auth.controller.js";

const router = Router();

router.get("/", routeGuard, getAllOrders);
router.get("/:id", routeGuard, getOrderById);
router.post("/", routeGuard, createOrder);
router.put("/:id", routeGuard, updateOrder);
router.delete("/:id", routeGuard, deleteOrder);

export default router;

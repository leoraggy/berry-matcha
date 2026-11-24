import { Router } from "express";
import {
  getAllToppings,
  getToppingById,
  createTopping,
  updateTopping,
  deleteTopping,
} from "../controller/topping.controller.js";
import { routeGuard } from "../controller/auth.controller.js";

const router = Router();

router.get("/", getAllToppings);
router.get("/:id", getToppingById);
router.post("/", routeGuard, createTopping);
router.put("/:id", routeGuard, updateTopping);
router.delete("/:id", routeGuard, deleteTopping);

export default router;

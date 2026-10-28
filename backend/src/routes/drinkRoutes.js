import { Router } from "express";
import {
  getAllDrinks,
  getDrinkById,
  createDrink,
} from "../controller/drinkController.js";

const router = Router();

router.get("/", getAllDrinks);
router.get("/:id", getDrinkById);
router.post("/", createDrink);

export default router;

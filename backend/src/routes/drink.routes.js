import { Router } from "express";
import {
  getAllDrinks,
  getDrinkSales,
  getDrinkById,
  createDrink,
  updateDrink,
  deleteDrink,
} from "../controller/drink.controller.js";
import { uploadDrinkImage } from "../controller/image.controller.js";
import { routeGuard } from "../controller/auth.controller.js";
import { uploadSingleImage } from "../config/multer.js";

const router = Router();

router.post("/image", routeGuard, uploadSingleImage("image"), uploadDrinkImage);
router.get("/", getAllDrinks);
router.get("/sales", routeGuard, getDrinkSales);
router.get("/:id", getDrinkById);
router.post("/", routeGuard, createDrink);
router.put("/:id", routeGuard, updateDrink);
router.delete("/:id", routeGuard, deleteDrink);

export default router;

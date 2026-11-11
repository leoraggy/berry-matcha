import { Router } from "express";
import multer from "multer";
import {
  getAllDrinks,
  getDrinkSales,
  getDrinkById,
  createDrink,
  updateDrink,
  deleteDrink,
} from "../controller/drinkController.js";
import { uploadDrinkImage } from "../controller/imageController.js";

const router = Router();
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const supportedTypes = [
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!supportedTypes.includes(file.mimetype)) {
      callback(new Error("Choose a PNG, JPG, WebP, or GIF image."));
      return;
    }

    callback(null, true);
  },
});

router.post(
  "/image",
  (req, res, next) => {
    imageUpload.single("image")(req, res, (error) => {
      if (error) {
        res.status(400).json({ message: error.message });
        return;
      }

      next();
    });
  },
  uploadDrinkImage,
);

router.get("/", getAllDrinks);
router.get("/sales", getDrinkSales);
router.get("/:id", getDrinkById);
router.post("/", createDrink);
router.put("/:id", updateDrink);
router.delete("/:id", deleteDrink);

export default router;

import { Router } from "express";
import { getHours, updateHours } from "../controller/hoursController.js";

const router = Router();

router.get("/", getHours);
router.put("/:id", updateHours);

export default router;

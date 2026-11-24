import { Router } from "express";
import { getHours, updateHours } from "../controller/hours.controller.js";
import { routeGuard } from "../controller/auth.controller.js";
const router = Router();

router.get("/", getHours);
router.put("/:id", routeGuard, updateHours);

export default router;

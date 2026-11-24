import { Router } from "express";
import passport from "passport";
import {
  getCurrentAdmin,
  googleCallback,
  logoutAdmin,
} from "../controller/auth.controller.js";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    prompt: "select_account",
    state: true,
  }),
);
router.get("/google/callback", googleCallback);
router.get("/me", getCurrentAdmin);
router.post("/logout", logoutAdmin);

export default router;

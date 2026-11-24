import cors from "cors";
import express from "express";
import session from "express-session";
import drinkRouter from "./routes/drink.routes.js";
import hoursRouter from "./routes/hours.routes.js";
import orderRouter from "./routes/order.routes.js";
import cartRouter from "./routes/cart.routes.js";
import checkoutRouter from "./routes/checkout.routes.js";
import toppingRouter from "./routes/topping.routes.js";
import { rateLimit } from "express-rate-limit";
import passport from "passport";
import authRouter from "./routes/auth.routes.js";
import { handleStripeWebhook } from "./controller/checkout.controller.js";
import mongoose from "mongoose";

export const createApp = ({
  sessionStore,
  sessionSecret = process.env.SESSION_SECRET,
} = {}) => {
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set to a random value of at least 32 characters.",
    );
  }

  const app = express();

  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json", limit: "1mb" }),
    handleStripeWebhook,
  );

  const allowedOrigins = [process.env.CLIENT_URL].filter(Boolean);
  if (process.env.NODE_ENV !== "production") {
    allowedOrigins.push("http://localhost:5173");
  }

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });

  app.use(limiter);
  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Origin is not allowed by CORS."));
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      name: "berry-matcha.sid",
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      ...(sessionStore ? { store: sessionStore } : {}),
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );
  app.use(passport.initialize());

  app.get("/health/live", (req, res) => {
    res.status(200).json({ status: "ok " });
  });
  app.get("/health/ready", (_req, res) => {
    const databaseReady = mongoose.connection.readyState === 1;

    res.status(databaseReady ? 200 : 503).json({
      status: databaseReady ? "ready" : "not_ready",
      checks: {
        mongodb: databaseReady ? "ok" : "unavailable",
      },
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/drinks", drinkRouter);
  app.use("/api/hours", hoursRouter);
  app.use("/api/orders", orderRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/toppings", toppingRouter);
  app.use("/api", checkoutRouter);

  app.use((error, _req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }
    console.error("Unhandled request error:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  });

  return app;
};

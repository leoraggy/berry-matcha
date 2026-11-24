import dotenv from "dotenv";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import { createApp } from "./app.js";
import { configureGoogleAuth } from "./controller/auth.controller.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const requiredEnvironmentVariables = [
  "CONNECTION_STRING",
  "STRIPE_PRIVATE_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

for (const variableName of requiredEnvironmentVariables) {
  if (!process.env[variableName]?.trim()) {
    throw new Error(`${variableName} must be configured.`);
  }
}

if (
  !/^mongodb(?:\+srv)?:\/\//.test(process.env.CONNECTION_STRING.trim())
) {
  throw new Error(
    "CONNECTION_STRING must be a valid MongoDB or MongoDB SRV connection URI.",
  );
}

if (!/^sk_(?:test|live)_/.test(process.env.STRIPE_PRIVATE_KEY.trim())) {
  throw new Error(
    "STRIPE_PRIVATE_KEY must be a valid Stripe secret key.",
  );
}

if (
  process.env.NODE_ENV === "production" &&
  process.env.STRIPE_PRIVATE_KEY.startsWith("sk_test_")
) {
  throw new Error(
    "A live Stripe private key (sk_live_) is required in production.",
  );
}

if (!/^whsec_[A-Za-z0-9]+/.test(process.env.STRIPE_WEBHOOK_SECRET.trim())) {
  throw new Error(
    "STRIPE_WEBHOOK_SECRET must be a valid Stripe webhook signing secret.",
  );
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error(
    "SESSION_SECRET must be set to a random value of at least 32 characters.",
  );
}

configureGoogleAuth();

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET must be configured.");
}

await mongoose.connect(process.env.CONNECTION_STRING);
console.log("Connected to MongoDB");

const sessionStore = MongoStore.create({
  clientPromise: Promise.resolve(mongoose.connection.getClient()),
  collectionName: "sessions",
  ttl: 7 * 24 * 60 * 60, //1 week
});
const app = createApp({ sessionStore, sessionSecret });

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

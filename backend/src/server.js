import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import drinkRouter from "./routes/drinkRoutes.js";
import hoursRouter from "./routes/hoursRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Couldn't connect to MongoDB", error));

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/drinks", drinkRouter);
app.use("/api/hours", hoursRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

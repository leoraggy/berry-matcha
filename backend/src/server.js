import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import router from "./routes/drinkRoutes.js";

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

// app.use("/", (req, res) => {
//   res.status(200).json({ message: "Welcome to matcha!" });
// });

app.use("/api/drinks", router);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

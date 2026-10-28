import mongoose from "mongoose";
import { drinkSchema } from "./drink";
const orderSchema = new mongoose.Schema({
  customerName: {
    String,
    required: true,
  },
  phoneNumber: {
    Number,
    required: true,
  },
  customerEmail: {
    String,
    required: true,
  },
  totalPrice: {
    Number,
    required: true,
  },
  pickupDate: Date,
  pickupTime: Date,
  createdAt: timeStamp,
  drinks: [drinkSchema],
});

export default mongoose.Model("Drink", drinkSchema);

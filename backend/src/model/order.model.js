import mongoose from "mongoose";

const orderDrinkSchema = new mongoose.Schema(
  {
    drinkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drink",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    sugar: {
      type: String,
      enum: ["Full", "Half", "Zero"],
      default: "Full",
    },
    ice: {
      type: String,
      enum: ["Normal", "Less", "No"],
      default: "Normal",
    },
    toppings: [String],
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    pickupDate: { type: Date, required: true },
    pickupTime: { type: String, required: true },
    location: {
      type: String,
      required: true,
    },
    drinks: {
      type: [orderDrinkSchema],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);

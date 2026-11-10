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
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    customerEmail: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    pickupDate: Date,
    pickupTime: String,
    drinks: {
      type: [orderDrinkSchema],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);

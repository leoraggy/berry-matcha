import mongoose from "mongoose";

const pickupLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  pickupDays: {
    type: [{ type: Number, min: 0, max: 6 }],
    required: true,
    validate: {
      validator: (days) => days.length > 0 && new Set(days).size === days.length,
      message: "Pickup days must contain unique weekday numbers.",
    },
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("PickupLocation", pickupLocationSchema);

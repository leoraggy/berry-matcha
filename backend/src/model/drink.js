import mongoose from "mongoose";

const drinkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: String,
  isAvailable: {
    type: Boolean,
    default: true,
  },
  allergens: String,
  imageLink: String,
});

export default mongoose.model("Drink", drinkSchema);

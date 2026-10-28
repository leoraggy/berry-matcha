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
  description: {
    type: String,
    required: true,
  },
  nutrients: String,
  allergens: String,
  imageLink: String,
});

export default mongoose.model("Drink", drinkSchema);

import mongoose from "mongoose";

const toppingsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    required: true,
  },
});

export default mongoose.model("Toppingss", toppingsSchema);

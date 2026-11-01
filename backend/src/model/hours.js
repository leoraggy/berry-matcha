import mongoose from "mongoose";

const hoursSchema = new mongoose.Schema({
  dayOfTheWeek: {
    type: String,
    required: true,
  },
  hours: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Hours", hoursSchema);

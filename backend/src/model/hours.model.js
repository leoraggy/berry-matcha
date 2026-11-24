import mongoose from "mongoose";

const hoursSchema = new mongoose.Schema(
  {
    dayOfTheWeek: {
      type: String,
      required: true,
    },
    hours: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  hours: {
    type: [hoursSchema],
    required: true,
  },
});

export default mongoose.model("Hours", locationSchema);

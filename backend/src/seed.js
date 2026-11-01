import dotenv from "dotenv";
import mongoose from "mongoose";
import Drink from "./model/drink.js";
import Hours from "./model/hours.js";

dotenv.config();

const drinks = [
  {
    name: "Iced Matcha Latte",
    price: 6.0,
    category: "Matcha",
  },
  {
    name: "Iced Coconut Matcha Latte",
    price: 6.0,
    category: "Matcha",
  },
  {
    name: "Iced Strawberry Matcha Latte",
    price: 6.0,
    category: "Matcha",
  },
  {
    name: "Iced Banana Matcha Latte",
    price: 6.0,
    category: "Matcha",
  },
  {
    name: "Iced Jasmine Matcha Latte",
    price: 6.0,
    category: "Matcha",
  },
  {
    name: "Iced Thai Tea",
    price: 6.0,
    category: "Tea",
  },
  {
    name: "Iced Coconut Thai Tea",
    price: 6.0,
    category: "Tea",
  },
];

const hours = [
  { dayOfTheWeek: "Mon", hours: "9:00am - 10:00am, 4:00pm - 5:00pm" },
  { dayOfTheWeek: "Tues", hours: "10:00am - 5:00pm" },
  { dayOfTheWeek: "Wed", hours: "9:00am - 11:00am, 4:00pm - 5:00pm" },
  { dayOfTheWeek: "Thu", hours: "10:00am - 5:00pm" },
  { dayOfTheWeek: "Fri", hours: "7:30am - 8:30am" },
  { dayOfTheWeek: "Sat", hours: "Closed" },
  { dayOfTheWeek: "Sun", hours: "Closed" },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING);

    await Drink.deleteMany({});

    await Promise.all([
      ...drinks.map(({ name, ...drink }) =>
        Drink.updateOne(
          { name },
          { $set: { name, ...drink } },
          {
            upsert: true,
            runValidators: true,
          },
        ),
      ),
      ...hours.map(({ dayOfTheWeek, ...schedule }) =>
        Hours.updateOne(
          { dayOfTheWeek },
          { $set: { dayOfTheWeek, ...schedule } },
          { upsert: true, runValidators: true },
        ),
      ),
    ]);

    console.log("Seeded drinks and hours.");
  } catch (error) {
    console.error("Failed to seed drinks and hours:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

await seedDatabase();

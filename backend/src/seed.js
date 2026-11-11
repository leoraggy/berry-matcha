import dotenv from "dotenv";
import mongoose from "mongoose";
import Drink from "./model/drink.js";
import Hours from "./model/hours.js";
import Order from "./model/order.js";

dotenv.config();

const drinks = [
  {
    name: "Iced Matcha Latte",
    price: 6.0,
    category: "Matcha",
    imageLink:
      "https://storage.googleapis.com/berry-matcha-photos/regular-matcha.png",
  },
  {
    name: "Iced Coconut Matcha Latte",
    price: 6.0,
    category: "Matcha",
    imageLink:
      "https://storage.googleapis.com/berry-matcha-photos/coconut-matcha-fake.jpg",
  },
  {
    name: "Iced Strawberry Matcha Latte",
    price: 6.0,
    category: "Matcha",
    imageLink:
      "https://storage.googleapis.com/berry-matcha-photos/strawberry-matcha-2.jpg",
  },
  {
    name: "Iced Banana Matcha Latte",
    price: 6.0,
    category: "Matcha",
    imageLink:
      "https://storage.googleapis.com/berry-matcha-photos/banana-bread.jpg",
  },
  {
    name: "Iced Jasmine Matcha Latte",
    price: 6.0,
    category: "Matcha",
    imageLink: "https://storage.googleapis.com/berry-matcha-photos/jasmine.jpg",
  },
  {
    name: "Iced Thai Tea",
    price: 6.0,
    category: "Tea",
    imageLink:
      "https://storage.googleapis.com/berry-matcha-photos/thai-tea.jpg",
  },
  {
    name: "Iced Coconut Thai Tea",
    price: 6.0,
    category: "Tea",
    imageLink:
      "https://storage.googleapis.com/berry-matcha-photos/coconut-thai.jpg",
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

const exampleCustomers = [
  "Alex Morgan",
  "Jordan Lee",
  "Taylor Nguyen",
  "Casey Patel",
  "Riley Chen",
  "Morgan Kim",
  "Jamie Rivera",
  "Avery Brooks",
  "Cameron Diaz",
  "Quinn Park",
  "Drew Wilson",
  "Skyler Garcia",
  "Parker Thompson",
  "Reese Martin",
  "Rowan Clark",
  "Emerson Davis",
  "Finley Moore",
  "Dakota Young",
  "Kendall Scott",
  "Sage Turner",
];

const createExampleOrders = (availableDrinks) => {
  const sugarOptions = ["Full", "Half", "Zero"];
  const iceOptions = ["Normal", "Less", "No"];
  const pickupTimes = ["10:00 AM", "11:30 AM", "1:00 PM", "3:30 PM"];

  return exampleCustomers.map((customerName, index) => {
    const drinkCount = (index % 3) + 1;
    const orderDrinks = Array.from({ length: drinkCount }, (_, itemIndex) => {
      const drink = availableDrinks[(index + itemIndex * 2) % availableDrinks.length];
      const quantity = ((index + itemIndex) % 2) + 1;

      return {
        drinkId: drink._id,
        name: drink.name,
        price: drink.price,
        quantity,
        sugar: sugarOptions[(index + itemIndex) % sugarOptions.length],
        ice: iceOptions[(index + itemIndex) % iceOptions.length],
      };
    });

    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + (index % 14) + 1);
    pickupDate.setHours(12, 0, 0, 0);

    return {
      customerName,
      phoneNumber: `555-01${String(index + 1).padStart(2, "0")}`,
      customerEmail: `example.order.${String(index + 1).padStart(2, "0")}@example.com`,
      totalPrice: Number(
        orderDrinks
          .reduce((total, drink) => total + drink.price * drink.quantity, 0)
          .toFixed(2),
      ),
      pickupDate,
      pickupTime: pickupTimes[index % pickupTimes.length],
      drinks: orderDrinks,
    };
  });
};

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

    const availableDrinks = await Drink.find().sort({ name: 1 });
    if (availableDrinks.length === 0) {
      throw new Error("Cannot seed example orders without drinks.");
    }

    const exampleOrders = createExampleOrders(availableDrinks);
    await Promise.all(
      exampleOrders.map(({ customerEmail, ...order }) =>
        Order.updateOne(
          { customerEmail },
          { $set: { customerEmail, ...order } },
          { upsert: true, runValidators: true },
        ),
      ),
    );

    console.log("Seeded drinks, hours, and 20 example orders.");
  } catch (error) {
    console.error("Failed to seed drinks, hours, and example orders:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

await seedDatabase();

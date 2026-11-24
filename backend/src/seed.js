import dotenv from "dotenv";
import mongoose from "mongoose";
import Drink from "./model/drink.model.js";
import Hours from "./model/hours.model.js";
import Order from "./model/order.model.js";
import Topping from "./model/topping.model.js";
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

const daysOfTheWeek = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
const pickupHoursByLocation = {
  "Southcenter Macy's Court": {
    Fri: "4pm - 8pm",
    Sat: "4pm - 8pm",
    Sun: "4pm - 8pm",
  },
  Ellensburg: {
    Mon: "9:00am - 10:00am, 4:00pm - 5:00pm",
    Tues: "10:00am - 5:00pm",
    Wed: "9:00am - 11:00am, 4:00pm - 5:00pm",
    Thu: "10:00am - 5:00pm",
  },
};

const createExampleOrders = (availableDrinks) => {
  const sugarOptions = ["Full", "Half", "Zero"];
  const iceOptions = ["Normal", "Less", "No"];

  return ["Demo Customer"].map((name, index) => {
    const drinkCount = (index % 3) + 1;
    const orderDrinks = Array.from({ length: drinkCount }, (_, itemIndex) => {
      const drink =
        availableDrinks[(index + itemIndex * 2) % availableDrinks.length];
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
    const daysUntilMonday = (1 - pickupDate.getDay() + 7) % 7 || 7;
    pickupDate.setDate(pickupDate.getDate() + daysUntilMonday);
    pickupDate.setHours(12, 0, 0, 0);

    return {
      name,
      phone: "000-000-0000",
      email: "demo@example.invalid",
      totalPrice: Number(
        orderDrinks
          .reduce((total, drink) => total + drink.price * drink.quantity, 0)
          .toFixed(2),
      ),
      pickupDate,
      pickupTime: "09:00",
      location: "Ellensburg",
      drinks: orderDrinks,
    };
  });
};

const seedDatabase = async () => {
  try {
    if (!process.env.CONNECTION_STRING) {
      throw new Error("CONNECTION_STRING must be set before seeding.");
    }

    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log(`Connected to database "${mongoose.connection.name}".`);

    await Promise.all([
      Drink.insertMany(drinks),
      Hours.insertMany(pickupLocations),
      Topping.create({ name: "Cream Topping", isAvailable: true }),
    ]);

    const availableDrinks = await Drink.find().sort({ name: 1 });
    if (availableDrinks.length === 0) {
      throw new Error("Cannot seed example orders without drinks.");
    }

    const exampleOrders = createExampleOrders(availableDrinks);
    await Order.insertMany(exampleOrders);

    console.log(
      `Seeded ${drinks.length} drinks, ${pickupLocations.length} pickup locations with weekly hours, 1 topping, and ${exampleOrders.length} example order.`,
    );
  } catch (error) {
    console.error("Failed to reset and seed the database:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

await seedDatabase();

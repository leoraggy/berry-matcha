import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const emptyDatabase = async () => {
  try {
    if (!process.env.CONNECTION_STRING) {
      throw new Error("CONNECTION_STRING must be set before seeding.");
    }

    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log(`Connected to database "${mongoose.connection.name}".`);

    await mongoose.connection.dropDatabase();
    console.log(`Emptied database "${mongoose.connection.name}".`);
  } catch (error) {
    console.error("Failed to reset and seed the database:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

await emptyDatabase();

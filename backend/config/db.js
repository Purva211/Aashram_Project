const mongoose = require("mongoose");

// Set up connection event listeners
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB.");
});

mongoose.connection.on("error", (err) => {
  console.error(`Mongoose connection error: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose disconnected from MongoDB. Attempting to reconnect...");
});

const connectDB = async (retries = 5, delay = 5000) => {
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/temple_management");
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`Error connecting to MongoDB: ${error.message}`);
      retries -= 1;
      console.log(`Retries left: ${retries}. Waiting ${delay/1000}s before reconnecting...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  console.error("MongoDB connection failed after all retries. Exiting process...");
  process.exit(1);
};

module.exports = connectDB;

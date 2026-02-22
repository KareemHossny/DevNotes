const mongoose = require("mongoose");

let cachedConnection = null;
let cachedPromise = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  mongoose.set("strictQuery", true);

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
    });
  }

  try {
    cachedConnection = await cachedPromise;
    return cachedConnection;
  } catch (err) {
    cachedPromise = null;
    throw err;
  }
};

module.exports = connectDB;

const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the MONGO_URI from environment variables.
 * Exits the process on failure so the app doesn't run without a database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 7+ no longer needs these flags, but kept for older driver clarity
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Hard exit — no point running without a DB
  }
};

// Log disconnection events in production so they surface in monitoring
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected");
});

module.exports = connectDB;

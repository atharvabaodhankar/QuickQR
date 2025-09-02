import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Qrious API 🚀" });
});

// Connect MongoDB
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => {
      console.error("❌ MongoDB error:", err.message);
      console.log(
        "💡 Make sure MongoDB is running or update MONGODB_URI in .env"
      );
    });
} else {
  console.log("⚠️  No MONGODB_URI found in .env file");
}

export default app;

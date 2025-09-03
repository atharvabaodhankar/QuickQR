import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import apiKeyRoutes from "./routes/apikey.js";
import authRoutes from "./routes/auth.js";
import qrcodeRoutes from "./routes/qrcode.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/apikey", apiKeyRoutes);
app.use("/", qrcodeRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to QuickQR API 🚀" });
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

export default app;

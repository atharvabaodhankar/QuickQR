import express from "express";
import QRCode from "qrcode";
import { apiKeyAuth } from "../middlewares/apikeyMiddleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Generate QR Code (protected by API Key)
router.get("/qrcode", apiKeyAuth, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const qrData = await QRCode.toDataURL(url);

    res.json({
      message: "QR Code generated",
      url,
      qrData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate QR Code (protected by JWT)
router.get("/qrcode/jwt", authMiddleware, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const qrData = await QRCode.toDataURL(url);

    res.json({
      message: "QR Code generated with JWT",
      url,
      qrData,
      user: {
        id: req.user.id,
        role: req.user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

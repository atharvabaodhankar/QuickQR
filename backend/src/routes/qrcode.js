import express from "express";
import QRCode from "qrcode";
import { apiKeyAuth, apiKeyRateLimit } from "../middlewares/apikeyMiddleware.js";
import { authMiddleware, jwtRateLimit } from "../middlewares/authMiddleware.js";
import QrCodeModel from "../models/QrCode.js";

const router = express.Router();

// Helper function to check for existing QR code (caching)
const findExistingQrCode = async (data, userId, generatedVia) => {
  return await QrCodeModel.findOne({ 
    data, 
    userId, 
    generatedVia 
  }).sort({ createdAt: -1 });
};

// Generate QR Code (protected by API Key)
router.get("/qrcode", apiKeyAuth, apiKeyRateLimit, async (req, res) => {
  try {
    const { url, name } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Validate URL length
    if (url.length > 2048) {
      return res.status(400).json({ error: "URL too long (max 2048 characters)" });
    }

    const userId = req.apiKey.userId;
    const qrName = name || `QR for ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}`;

    // Check for existing QR code (caching)
    let existingQrCode = await findExistingQrCode(url, userId, "apikey");
    
    if (existingQrCode) {
      // Update access count and last accessed
      existingQrCode.accessCount += 1;
      existingQrCode.lastAccessed = new Date();
      await existingQrCode.save();

      return res.json({
        message: "QR Code retrieved from cache",
        qrCode: {
          id: existingQrCode._id,
          name: existingQrCode.name,
          url: existingQrCode.data,
          qrData: existingQrCode.qrCodeImage,
          accessCount: existingQrCode.accessCount,
          createdAt: existingQrCode.createdAt,
          cached: true
        },
        usage: req.usage
      });
    }

    // Generate new QR code
    const qrData = QRCode.toDataURL(url);

    // Save to database
    const qrCode = new QrCodeModel({
      name: qrName,
      data: url,
      qrCodeImage: qrData,
      userId: userId,
      apiKeyId: req.apiKey._id,
      generatedVia: "apikey",
      accessCount: 1,
      lastAccessed: new Date()
    });

    await qrCode.save();

    res.status(201).json({
      message: "QR Code generated and saved",
      qrCode: {
        id: qrCode._id,
        name: qrCode.name,
        url: qrCode.data,
        qrData: qrCode.qrCodeImage,
        accessCount: qrCode.accessCount,
        createdAt: qrCode.createdAt,
        cached: false
      },
      usage: req.usage
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate QR Code (protected by JWT)
router.get("/qrcode/jwt", authMiddleware, jwtRateLimit, async (req, res) => {
  try {
    const { url, name } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Validate URL length
    if (url.length > 2048) {
      return res.status(400).json({ error: "URL too long (max 2048 characters)" });
    }

    const userId = req.user.id;
    const qrName = name || `QR for ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}`;

    // Check for existing QR code (caching)
    let existingQrCode = await findExistingQrCode(url, userId, "jwt");
    
    if (existingQrCode) {
      // Update access count and last accessed
      existingQrCode.accessCount += 1;
      existingQrCode.lastAccessed = new Date();
      await existingQrCode.save();

      return res.json({
        message: "QR Code retrieved from cache",
        qrCode: {
          id: existingQrCode._id,
          name: existingQrCode.name,
          url: existingQrCode.data,
          qrData: existingQrCode.qrCodeImage,
          accessCount: existingQrCode.accessCount,
          createdAt: existingQrCode.createdAt,
          cached: true
        },
        user: {
          id: req.user.id,
          role: req.user.role
        },
        usage: req.usage
      });
    }

    // Generate new QR code
    const qrData = QRCode.toDataURL(url);

    // Save to database
    const qrCode = new QrCodeModel({
      name: qrName,
      data: url,
      qrCodeImage: qrData,
      userId: userId,
      generatedVia: "jwt",
      accessCount: 1,
      lastAccessed: new Date()
    });

    await qrCode.save();

    res.status(201).json({
      message: "QR Code generated and saved",
      qrCode: {
        id: qrCode._id,
        name: qrCode.name,
        url: qrCode.data,
        qrData: qrCode.qrCodeImage,
        accessCount: qrCode.accessCount,
        createdAt: qrCode.createdAt,
        cached: false
      },
      user: {
        id: req.user.id,
        role: req.user.role
      },
      usage: req.usage
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

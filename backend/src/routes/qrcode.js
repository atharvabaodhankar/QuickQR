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

// Get user's QR codes (JWT protected)
router.get("/qrcodes", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const userId = req.user.id;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [qrCodes, total] = await Promise.all([
      QrCodeModel.find({ userId })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-qrCodeImage'), // Exclude base64 data for list view
      QrCodeModel.countDocuments({ userId })
    ]);

    res.json({
      qrCodes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific QR code by ID (JWT protected)
router.get("/qrcodes/:id", authMiddleware, async (req, res) => {
  try {
    const qrCode = await QrCodeModel.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!qrCode) {
      return res.status(404).json({ error: "QR Code not found" });
    }

    // Update access count
    qrCode.accessCount += 1;
    qrCode.lastAccessed = new Date();
    await qrCode.save();

    res.json({
      qrCode: {
        id: qrCode._id,
        name: qrCode.name,
        url: qrCode.data,
        qrData: qrCode.qrCodeImage,
        generatedVia: qrCode.generatedVia,
        accessCount: qrCode.accessCount,
        lastAccessed: qrCode.lastAccessed,
        createdAt: qrCode.createdAt,
        updatedAt: qrCode.updatedAt
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete QR code (JWT protected)
router.delete("/qrcodes/:id", authMiddleware, async (req, res) => {
  try {
    const qrCode = await QrCodeModel.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!qrCode) {
      return res.status(404).json({ error: "QR Code not found" });
    }

    res.json({ 
      message: "QR Code deleted successfully",
      deletedQrCode: {
        id: qrCode._id,
        name: qrCode.name,
        url: qrCode.data
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get QR code analytics (JWT protected)
router.get("/analytics/qrcodes", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const [
      totalQrCodes,
      recentQrCodes,
      totalAccesses,
      byGeneratedVia,
      topQrCodes
    ] = await Promise.all([
      QrCodeModel.countDocuments({ userId }),
      QrCodeModel.countDocuments({ userId, createdAt: { $gte: daysAgo } }),
      QrCodeModel.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: null, totalAccesses: { $sum: "$accessCount" } } }
      ]),
      QrCodeModel.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: "$generatedVia", count: { $sum: 1 } } }
      ]),
      QrCodeModel.find({ userId })
        .sort({ accessCount: -1 })
        .limit(5)
        .select('name data accessCount createdAt')
    ]);

    res.json({
      analytics: {
        totalQrCodes,
        recentQrCodes: recentQrCodes,
        totalAccesses: totalAccesses[0]?.totalAccesses || 0,
        generationMethods: byGeneratedVia,
        topQrCodes,
        period: `Last ${days} days`
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

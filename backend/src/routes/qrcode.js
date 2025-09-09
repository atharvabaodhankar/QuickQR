import express from "express";
import QRCode from "qrcode";
import {
  apiKeyAuth,
  apiKeyRateLimit,
} from "../middlewares/apikeyMiddleware.js";
import { authMiddleware, jwtRateLimit } from "../middlewares/authMiddleware.js";
import QrCodeModel from "../models/QrCode.js";

const router = express.Router();

// QR Code Scan Tracking Route (Public - no authentication required)
router.get("/scan/:id", async (req, res) => {
  try {
    const qrCode = await QrCodeModel.findById(req.params.id);
    
    if (!qrCode) {
      return res.status(404).json({ error: "QR Code not found" });
    }

    // Extract tracking information
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown';
    const referrer = req.get('Referrer') || req.get('Referer') || 'Direct';

    // Update scan statistics
    qrCode.scanCount += 1;
    qrCode.lastScanned = new Date();
    
    // Add to scan history (keep last 100 scans to prevent unlimited growth)
    qrCode.scanHistory.push({
      timestamp: new Date(),
      userAgent,
      ipAddress,
      referrer
    });
    
    // Keep only the last 100 scan records
    if (qrCode.scanHistory.length > 100) {
      qrCode.scanHistory = qrCode.scanHistory.slice(-100);
    }

    await qrCode.save();

    // Redirect to the actual URL
    res.redirect(qrCode.data);
  } catch (err) {
    console.error('Scan tracking error:', err);
    // If there's an error, still try to redirect to a fallback
    res.status(500).json({ error: "Tracking failed" });
  }
});

// Helper function to generate tracking URL
const generateTrackingUrl = (qrCodeId) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/scan/${qrCodeId}`;
};

// Helper function to check for existing QR code (caching)
const findExistingQrCode = async (data, userId, generatedVia) => {
  return await QrCodeModel.findOne({
    data,
    userId,
    generatedVia,
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
      return res
        .status(400)
        .json({ error: "URL too long (max 2048 characters)" });
    }

    const userId = req.apiKey.userId;
    const qrName =
      name || `QR for ${url.substring(0, 50)}${url.length > 50 ? "..." : ""}`;

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
          scanCount: existingQrCode.scanCount,
          lastScanned: existingQrCode.lastScanned,
          createdAt: existingQrCode.createdAt,
          cached: true,
        },
        usage: req.usage,
      });
    }

    // Generate temporary QR code first to satisfy schema requirements
    const tempQrData = await QRCode.toDataURL(url);

    // Save to database to get the ID
    const qrCode = new QrCodeModel({
      name: qrName,
      data: url,
      qrCodeImage: tempQrData, // Temporary QR code
      userId: userId,
      apiKeyId: req.apiKey._id,
      generatedVia: "apikey",
      accessCount: 1,
      lastAccessed: new Date(),
    });

    await qrCode.save();

    // Generate QR code with tracking URL
    const trackingUrl = generateTrackingUrl(qrCode._id);
    const qrData = await QRCode.toDataURL(trackingUrl);

    // Update with the tracking QR code image
    qrCode.qrCodeImage = qrData;
    await qrCode.save();

    res.status(201).json({
      message: "QR Code generated and saved",
      qrCode: {
        id: qrCode._id,
        name: qrCode.name,
        url: qrCode.data,
        qrData: qrCode.qrCodeImage,
        accessCount: qrCode.accessCount,
        scanCount: qrCode.scanCount,
        lastScanned: qrCode.lastScanned,
        createdAt: qrCode.createdAt,
        cached: false,
      },
      usage: req.usage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate QR Code with customization (protected by API Key)
router.post("/qrcode/generate", apiKeyAuth, apiKeyRateLimit, async (req, res) => {
  try {
    const { url, name, customization = {} } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Validate URL length
    if (url.length > 2048) {
      return res
        .status(400)
        .json({ error: "URL too long (max 2048 characters)" });
    }

    const userId = req.apiKey.userId;
    const qrName =
      name || `QR for ${url.substring(0, 50)}${url.length > 50 ? "..." : ""}`;

    // Set default customization options
    const qrOptions = {
      width: customization.size || 200,
      margin: customization.margin || 4,
      color: {
        dark: customization.foregroundColor || "#000000",
        light: customization.backgroundColor || "#FFFFFF",
      },
      errorCorrectionLevel: customization.errorCorrectionLevel || "M",
    };

    // Generate temporary QR code first to satisfy schema requirements
    const tempQrData = await QRCode.toDataURL(url, qrOptions);

    // Save to database to get the ID
    const qrCode = new QrCodeModel({
      name: qrName,
      data: url,
      qrCodeImage: tempQrData, // Temporary QR code
      userId: userId,
      apiKeyId: req.apiKey._id,
      generatedVia: "apikey",
      customization: {
        size: qrOptions.width,
        foregroundColor: qrOptions.color.dark,
        backgroundColor: qrOptions.color.light,
        errorCorrectionLevel: qrOptions.errorCorrectionLevel,
        margin: qrOptions.margin,
      },
      accessCount: 1,
      lastAccessed: new Date(),
    });

    await qrCode.save();

    // Generate QR code with tracking URL and customization
    const trackingUrl = generateTrackingUrl(qrCode._id);
    const qrData = await QRCode.toDataURL(trackingUrl, qrOptions);

    // Update with the tracking QR code image
    qrCode.qrCodeImage = qrData;
    await qrCode.save();

    res.status(201).json({
      message: "QR Code generated and saved",
      qrCode: {
        id: qrCode._id,
        name: qrCode.name,
        url: qrCode.data,
        qrData: qrCode.qrCodeImage,
        customization: qrCode.customization,
        accessCount: qrCode.accessCount,
        scanCount: qrCode.scanCount,
        lastScanned: qrCode.lastScanned,
        createdAt: qrCode.createdAt,
        cached: false,
      },
      usage: req.usage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate QR Code (protected by JWT) - with customization
router.post(
  "/qrcode/generate-jwt",
  authMiddleware,
  jwtRateLimit,
  async (req, res) => {
    try {
      const { url, name, customization = {} } = req.body;

      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Validate URL length
      if (url.length > 2048) {
        return res
          .status(400)
          .json({ error: "URL too long (max 2048 characters)" });
      }

      const userId = req.user.id;
      const qrName =
        name || `QR for ${url.substring(0, 50)}${url.length > 50 ? "..." : ""}`;

      // Set default customization options
      const qrOptions = {
        width: customization.size || 200,
        margin: customization.margin || 4,
        color: {
          dark: customization.foregroundColor || "#000000",
          light: customization.backgroundColor || "#FFFFFF",
        },
        errorCorrectionLevel: customization.errorCorrectionLevel || "M",
      };

      // Generate temporary QR code first to satisfy schema requirements
      const tempQrData = await QRCode.toDataURL(url, qrOptions);

      // Save to database to get the ID
      const qrCode = new QrCodeModel({
        name: qrName,
        data: url,
        qrCodeImage: tempQrData, // Temporary QR code
        userId: userId,
        generatedVia: "jwt",
        customization: {
          size: qrOptions.width,
          foregroundColor: qrOptions.color.dark,
          backgroundColor: qrOptions.color.light,
          errorCorrectionLevel: qrOptions.errorCorrectionLevel,
          margin: qrOptions.margin,
        },
        accessCount: 1,
        lastAccessed: new Date(),
      });

      await qrCode.save();

      // Generate QR code with tracking URL and customization
      const trackingUrl = generateTrackingUrl(qrCode._id);
      const qrData = await QRCode.toDataURL(trackingUrl, qrOptions);

      // Update with the tracking QR code image
      qrCode.qrCodeImage = qrData;
      await qrCode.save();

      res.status(201).json({
        message: "QR Code generated and saved",
        qrCode: {
          id: qrCode._id,
          name: qrCode.name,
          url: qrCode.data,
          qrData: qrCode.qrCodeImage,
          customization: qrCode.customization,
          accessCount: qrCode.accessCount,
          scanCount: qrCode.scanCount,
          lastScanned: qrCode.lastScanned,
          createdAt: qrCode.createdAt,
          cached: false,
        },
        user: {
          id: req.user.id,
          role: req.user.role,
        },
        usage: req.usage,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Preview QR Code (no database save) - JWT protected
router.post("/qrcode/preview", authMiddleware, async (req, res) => {
  try {
    const { url, customization = {} } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Validate URL length
    if (url.length > 2048) {
      return res
        .status(400)
        .json({ error: "URL too long (max 2048 characters)" });
    }

    // Set default customization options
    const qrOptions = {
      width: customization.size || 200,
      margin: customization.margin || 4,
      color: {
        dark: customization.foregroundColor || "#000000",
        light: customization.backgroundColor || "#FFFFFF",
      },
      errorCorrectionLevel: customization.errorCorrectionLevel || "M",
    };

    // Generate QR code with customization (no database save)
    const qrData = await QRCode.toDataURL(url, qrOptions);

    res.json({
      message: "QR Code preview generated",
      qrCode: {
        url: url,
        qrData: qrData,
        customization: {
          size: qrOptions.width,
          foregroundColor: qrOptions.color.dark,
          backgroundColor: qrOptions.color.light,
          errorCorrectionLevel: qrOptions.errorCorrectionLevel,
          margin: qrOptions.margin,
        },
        isPreview: true,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy endpoint for backward compatibility
router.get("/qrcode/jwt", authMiddleware, jwtRateLimit, async (req, res) => {
  try {
    const { url, name } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Validate URL length
    if (url.length > 2048) {
      return res
        .status(400)
        .json({ error: "URL too long (max 2048 characters)" });
    }

    const userId = req.user.id;
    const qrName =
      name || `QR for ${url.substring(0, 50)}${url.length > 50 ? "..." : ""}`;

    // Generate temporary QR code first to satisfy schema requirements
    const tempQrData = await QRCode.toDataURL(url);

    // Save to database to get the ID
    const qrCode = new QrCodeModel({
      name: qrName,
      data: url,
      qrCodeImage: tempQrData, // Temporary QR code
      userId: userId,
      generatedVia: "jwt",
      accessCount: 1,
      lastAccessed: new Date(),
    });

    await qrCode.save();

    // Generate QR code with tracking URL
    const trackingUrl = generateTrackingUrl(qrCode._id);
    const qrData = await QRCode.toDataURL(trackingUrl);

    // Update with the tracking QR code image
    qrCode.qrCodeImage = qrData;
    await qrCode.save();

    res.status(201).json({
      message: "QR Code generated and saved",
      qrCode: {
        id: qrCode._id,
        name: qrCode.name,
        url: qrCode.data,
        qrData: qrCode.qrCodeImage,
        customization: qrCode.customization,
        accessCount: qrCode.accessCount,
        createdAt: qrCode.createdAt,
        cached: false,
      },
      user: {
        id: req.user.id,
        role: req.user.role,
      },
      usage: req.usage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's QR codes (JWT protected)
router.get("/qrcodes", authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const userId = req.user.id;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [qrCodes, total] = await Promise.all([
      QrCodeModel.find({ userId })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-qrCodeImage"), // Exclude base64 data for list view
      QrCodeModel.countDocuments({ userId }),
    ]);

    res.json({
      qrCodes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
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
      userId: req.user.id,
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
        scanCount: qrCode.scanCount,
        lastAccessed: qrCode.lastAccessed,
        lastScanned: qrCode.lastScanned,
        scanHistory: qrCode.scanHistory.slice(-10), // Last 10 scans for details
        createdAt: qrCode.createdAt,
        updatedAt: qrCode.updatedAt,
      },
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
      userId: req.user.id,
    });

    if (!qrCode) {
      return res.status(404).json({ error: "QR Code not found" });
    }

    res.json({
      message: "QR Code deleted successfully",
      deletedQrCode: {
        id: qrCode._id,
        name: qrCode.name,
        url: qrCode.data,
      },
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
      totalScans,
      byGeneratedVia,
      topQrCodes,
      topScannedQrCodes,
    ] = await Promise.all([
      QrCodeModel.countDocuments({ userId }),
      QrCodeModel.countDocuments({ userId, createdAt: { $gte: daysAgo } }),
      QrCodeModel.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: null, totalAccesses: { $sum: "$accessCount" } } },
      ]),
      QrCodeModel.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: null, totalScans: { $sum: "$scanCount" } } },
      ]),
      QrCodeModel.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: "$generatedVia", count: { $sum: 1 } } },
      ]),
      QrCodeModel.find({ userId })
        .sort({ accessCount: -1 })
        .limit(5)
        .select("name data accessCount scanCount createdAt"),
      QrCodeModel.find({ userId })
        .sort({ scanCount: -1 })
        .limit(5)
        .select("name data accessCount scanCount lastScanned createdAt"),
    ]);

    res.json({
      analytics: {
        totalQrCodes,
        recentQrCodes: recentQrCodes,
        totalAccesses: totalAccesses[0]?.totalAccesses || 0,
        totalScans: totalScans[0]?.totalScans || 0,
        generationMethods: byGeneratedVia,
        topQrCodes,
        topScannedQrCodes,
        period: `Last ${days} days`,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

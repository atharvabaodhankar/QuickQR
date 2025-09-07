import ApiKey from "../models/ApiKey.js";
import { generateApiKey } from "../utils/generateKey.js";

// Generate API Key
export const createApiKey = async (req, res) => {
  try {
    const userId = req.user.id; // comes from JWT middleware

    const key = generateApiKey();
    const apiKey = new ApiKey({
      name: req.body.name || 'Default API Key',
      key,
      userId: userId
    });

    await apiKey.save();

    res.status(201).json({
      message: "API Key generated",
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        key: apiKey.key,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all API keys of user
export const getApiKeys = async (req, res) => {
  try {
    const userId = req.user.id;
    const keys = await ApiKey.find({ userId: userId });
    
    // Import QrCode model for usage calculations
    const QrCode = (await import("../models/QrCode.js")).default;
    
    // Calculate usage statistics for each API key
    const formattedKeys = await Promise.all(keys.map(async (key) => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Count usage for different time periods
      const [hourlyCount, dailyCount, monthlyCount] = await Promise.all([
        QrCode.countDocuments({ 
          apiKeyId: key._id, 
          createdAt: { $gte: oneHourAgo } 
        }),
        QrCode.countDocuments({ 
          apiKeyId: key._id, 
          createdAt: { $gte: oneDayAgo } 
        }),
        QrCode.countDocuments({ 
          apiKeyId: key._id, 
          createdAt: { $gte: oneMonthAgo } 
        })
      ]);

      // Default limits (should match the middleware)
      const HOURLY_LIMIT = 100;
      const DAILY_LIMIT = 1000;
      const MONTHLY_LIMIT = 10000;

      return {
        id: key._id,
        name: key.name,
        key: key.key,
        isActive: key.isActive,
        lastUsed: key.lastUsed,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt,
        usage: {
          hourly: { used: hourlyCount, limit: HOURLY_LIMIT },
          daily: { used: dailyCount, limit: DAILY_LIMIT },
          monthly: { used: monthlyCount, limit: MONTHLY_LIMIT }
        }
      };
    }));
    
    res.json(formattedKeys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Revoke API key
export const revokeApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = await ApiKey.findById(id);

    if (!apiKey) return res.status(404).json({ error: "API Key not found" });
    if (String(apiKey.userId) !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    apiKey.isActive = false;
    await apiKey.save();

    res.json({ message: "API Key revoked" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete API key
export const deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = await ApiKey.findById(id);

    if (!apiKey) return res.status(404).json({ error: "API Key not found" });
    if (String(apiKey.userId) !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await ApiKey.findByIdAndDelete(id);

    res.json({ 
      message: "API Key deleted successfully",
      deletedApiKey: {
        id: apiKey._id,
        name: apiKey.name
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

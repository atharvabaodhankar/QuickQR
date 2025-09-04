import ApiKey from "../models/ApiKey.js";

export const apiKeyAuth = async (req, res, next) => {
  try {
    const key = req.header("x-api-key");
    if (!key) return res.status(401).json({ error: "API key required" });

    const apiKey = await ApiKey.findOne({ key, isActive: true });
    if (!apiKey) return res.status(403).json({ error: "Invalid or revoked API key" });

    // Update last used timestamp
    apiKey.lastUsed = new Date();
    await apiKey.save();

    // Attach key info to request
    req.apiKey = apiKey;
    next();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Rate limiting middleware for API keys
export const apiKeyRateLimit = async (req, res, next) => {
  try {
    const apiKey = req.apiKey;
    if (!apiKey) {
      return res.status(401).json({ error: "API key authentication required" });
    }

    // Default limits (can be made configurable per API key later)
    const HOURLY_LIMIT = 100;
    const DAILY_LIMIT = 1000;
    const MONTHLY_LIMIT = 10000;

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Count recent usage (this would be more efficient with a separate usage tracking collection)
    const QrCode = (await import("../models/QrCode.js")).default;
    
    const [hourlyCount, dailyCount, monthlyCount] = await Promise.all([
      QrCode.countDocuments({ 
        apiKeyId: apiKey._id, 
        createdAt: { $gte: oneHourAgo } 
      }),
      QrCode.countDocuments({ 
        apiKeyId: apiKey._id, 
        createdAt: { $gte: oneDayAgo } 
      }),
      QrCode.countDocuments({ 
        apiKeyId: apiKey._id, 
        createdAt: { $gte: oneMonthAgo } 
      })
    ]);

    // Check limits
    if (hourlyCount >= HOURLY_LIMIT) {
      return res.status(429).json({ 
        error: "Hourly rate limit exceeded", 
        limit: HOURLY_LIMIT,
        used: hourlyCount,
        resetTime: new Date(oneHourAgo.getTime() + 60 * 60 * 1000)
      });
    }

    if (dailyCount >= DAILY_LIMIT) {
      return res.status(429).json({ 
        error: "Daily rate limit exceeded", 
        limit: DAILY_LIMIT,
        used: dailyCount,
        resetTime: new Date(oneDayAgo.getTime() + 24 * 60 * 60 * 1000)
      });
    }

    if (monthlyCount >= MONTHLY_LIMIT) {
      return res.status(429).json({ 
        error: "Monthly rate limit exceeded", 
        limit: MONTHLY_LIMIT,
        used: monthlyCount,
        resetTime: new Date(oneMonthAgo.getTime() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    // Add usage info to request for analytics
    req.usage = {
      hourly: { used: hourlyCount, limit: HOURLY_LIMIT },
      daily: { used: dailyCount, limit: DAILY_LIMIT },
      monthly: { used: monthlyCount, limit: MONTHLY_LIMIT }
    };

    next();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

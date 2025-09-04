import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};

// Rate limiting middleware for JWT users
export const jwtRateLimit = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "JWT authentication required" });
    }

    // More generous limits for authenticated users vs API keys
    const HOURLY_LIMIT = 200;
    const DAILY_LIMIT = 2000;
    const MONTHLY_LIMIT = 20000;

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Count recent usage for this user
    const QrCode = (await import("../models/QrCode.js")).default;
    
    const [hourlyCount, dailyCount, monthlyCount] = await Promise.all([
      QrCode.countDocuments({ 
        userId: user.id, 
        generatedVia: "jwt",
        createdAt: { $gte: oneHourAgo } 
      }),
      QrCode.countDocuments({ 
        userId: user.id, 
        generatedVia: "jwt",
        createdAt: { $gte: oneDayAgo } 
      }),
      QrCode.countDocuments({ 
        userId: user.id, 
        generatedVia: "jwt",
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

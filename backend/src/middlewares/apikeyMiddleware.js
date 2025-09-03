import ApiKey from "../models/ApiKey.js";

export const apiKeyAuth = async (req, res, next) => {
  try {
    const key = req.header("x-api-key");
    if (!key) return res.status(401).json({ error: "API key required" });

    const apiKey = await ApiKey.findOne({ key, status: "active" });
    if (!apiKey) return res.status(403).json({ error: "Invalid or revoked API key" });

    // Check expiry
    if (new Date() > apiKey.expiresAt) {
      return res.status(403).json({ error: "API key expired" });
    }

    // Check quota
    if (apiKey.used >= apiKey.quota) {
      return res.status(429).json({ error: "API key quota exceeded" });
    }

    // Attach key info to request
    req.apiKey = apiKey;
    next();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

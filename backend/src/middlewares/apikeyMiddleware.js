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

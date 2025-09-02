import ApiKey from "../models/ApiKey.js";
import { generateApiKey } from "../utils/generateKey.js";

// Generate API Key
export const createApiKey = async (req, res) => {
  try {
    const userId = req.user.id; // comes from JWT middleware

    const key = generateApiKey();
    const apiKey = new ApiKey({
      key,
      ownerId: userId,
      quota: 10
    });

    await apiKey.save();

    res.status(201).json({
      message: "API Key generated",
      apiKey: apiKey.key,
      expiresAt: apiKey.expiresAt
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all API keys of user
export const getApiKeys = async (req, res) => {
  try {
    const userId = req.user.id;
    const keys = await ApiKey.find({ ownerId: userId });
    res.json(keys);
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
    if (String(apiKey.ownerId) !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    apiKey.status = "revoked";
    await apiKey.save();

    res.json({ message: "API Key revoked" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

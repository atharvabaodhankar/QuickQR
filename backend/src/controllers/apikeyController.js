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

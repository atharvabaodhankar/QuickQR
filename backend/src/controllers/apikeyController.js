const ApiKey = require('../models/ApiKey');
const crypto = require('crypto');

const apikeyController = {
  async generateApiKey(req, res) {
    try {
      const { name } = req.body;
      const userId = req.user.userId;

      // Generate API key
      const key = crypto.randomBytes(32).toString('hex');
      
      const apiKey = new ApiKey({
        name,
        key,
        userId
      });

      await apiKey.save();
      
      res.status(201).json(apiKey);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getApiKeys(req, res) {
    try {
      const apiKeys = await ApiKey.find({ userId: req.user.userId }).select('-key');
      res.json(apiKeys);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteApiKey(req, res) {
    try {
      const apiKey = await ApiKey.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId
      });
      
      if (!apiKey) {
        return res.status(404).json({ error: 'API Key not found' });
      }
      
      res.json({ message: 'API Key deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = apikeyController;
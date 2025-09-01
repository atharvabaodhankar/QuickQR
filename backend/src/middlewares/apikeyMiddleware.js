const ApiKey = require('../models/ApiKey');

const apikeyMiddleware = {
  async validateApiKey(req, res, next) {
    try {
      const apiKey = req.header('X-API-Key');
      
      if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
      }

      const validKey = await ApiKey.findOne({ key: apiKey, isActive: true });
      if (!validKey) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      // Update last used timestamp
      validKey.lastUsed = new Date();
      await validKey.save();

      req.apiKey = validKey;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = apikeyMiddleware;
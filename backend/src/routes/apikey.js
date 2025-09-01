const express = require('express');
const router = express.Router();
const apikeyController = require('../controllers/apikeyController');
const authMiddleware = require('../middlewares/authMiddleware');

// API Key routes
router.post('/generate', authMiddleware.authenticate, apikeyController.generateApiKey);
router.get('/', authMiddleware.authenticate, apikeyController.getApiKeys);
router.delete('/:id', authMiddleware.authenticate, apikeyController.deleteApiKey);

module.exports = router;
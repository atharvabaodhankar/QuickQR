const express = require('express');
const router = express.Router();
const qrcodeController = require('../controllers/qrcodeController');
const authMiddleware = require('../middlewares/authMiddleware');

// QR Code routes
router.post('/generate', authMiddleware.authenticate, qrcodeController.generateQRCode);
router.get('/:id', qrcodeController.getQRCode);
router.delete('/:id', authMiddleware.authenticate, qrcodeController.deleteQRCode);

module.exports = router;
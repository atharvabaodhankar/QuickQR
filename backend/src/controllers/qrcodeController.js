const QrCode = require('../models/QrCode');
const QRCode = require('qrcode');

const qrcodeController = {
  async generateQRCode(req, res) {
    try {
      const { data, name } = req.body;
      const userId = req.user.userId;

      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(data);
      
      // Save to database
      const qrCode = new QrCode({
        name,
        data,
        qrCodeImage: qrCodeDataURL,
        userId
      });

      await qrCode.save();
      
      res.status(201).json(qrCode);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getQRCode(req, res) {
    try {
      const qrCode = await QrCode.findById(req.params.id);
      if (!qrCode) {
        return res.status(404).json({ error: 'QR Code not found' });
      }
      
      res.json(qrCode);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteQRCode(req, res) {
    try {
      const qrCode = await QrCode.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId
      });
      
      if (!qrCode) {
        return res.status(404).json({ error: 'QR Code not found' });
      }
      
      res.json({ message: 'QR Code deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = qrcodeController;
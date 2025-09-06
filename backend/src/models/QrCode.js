import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  data: {
    type: String,
    required: true,
    maxlength: 2048 // URL length limit
  },
  qrCodeImage: {
    type: String,
    required: true // base64 encoded image
  },
  customization: {
    size: {
      type: Number,
      default: 200,
      min: 100,
      max: 1000
    },
    foregroundColor: {
      type: String,
      default: '#000000',
      match: /^#[0-9A-F]{6}$/i
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF',
      match: /^#[0-9A-F]{6}$/i
    },
    errorCorrectionLevel: {
      type: String,
      enum: ['L', 'M', 'Q', 'H'],
      default: 'M'
    },
    margin: {
      type: Number,
      default: 4,
      min: 0,
      max: 20
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  apiKeyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ApiKey",
    required: false // Only set when generated via API key
  },
  generatedVia: {
    type: String,
    enum: ["jwt", "apikey"],
    required: true
  },
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

qrCodeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
qrCodeSchema.index({ userId: 1, createdAt: -1 });
qrCodeSchema.index({ data: 1 }); // For caching duplicate URLs

export default mongoose.model("QrCode", qrCodeSchema);

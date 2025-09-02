import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  quota: {
    type: Number,
    default: 1000 // monthly limit
  },
  used: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days from creation
  },
  status: {
    type: String,
    enum: ["active", "revoked"],
    default: "active"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("ApiKey", apiKeySchema);

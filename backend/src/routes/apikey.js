import express from "express";
import { createApiKey, getApiKeys, revokeApiKey } from "../controllers/apikeyController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected by JWT
router.post("/generate", authMiddleware, createApiKey);
router.get("/", authMiddleware, getApiKeys);
router.post("/revoke/:id", authMiddleware, revokeApiKey);

export default router;

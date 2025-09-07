import express from "express";
import { createApiKey, getApiKeys, revokeApiKey, deleteApiKey } from "../controllers/apikeyController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected by JWT
router.post("/generate", authMiddleware, createApiKey);
router.get("/", authMiddleware, getApiKeys);
router.post("/revoke/:id", authMiddleware, revokeApiKey);
router.delete("/:id", authMiddleware, deleteApiKey);

export default router;

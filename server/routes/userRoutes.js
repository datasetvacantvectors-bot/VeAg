import express from "express";
import { body } from "express-validator";
import {
  authenticateUser,
  getUserById,
  getUserByEmail,
  updateUserProfile,
  getNameHistory,
  verifyUserToken,
} from "../controllers/userController.js";
import authMiddleware from "../config/authMiddleware.js";

const router = express.Router();

// Authenticate or create user (POST /api/users/auth) - UNPROTECTED
router.post(
  "/auth",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("name").notEmpty().withMessage("Name is required"),
    body("firebaseUid").notEmpty().withMessage("Firebase UID is required"),
  ],
  authenticateUser,
);

// Verify user token (GET /api/users/verify) - PROTECTED
router.get("/verify", authMiddleware, verifyUserToken);

// Get user by userId (GET /api/users/:userId) - PROTECTED
router.get("/:userId", authMiddleware, getUserById);

// Get user by email (GET /api/users/email/:email) - PROTECTED
router.get("/email/:email", authMiddleware, getUserByEmail);

// Update user profile (PUT /api/users/:userId) - PROTECTED
router.put(
  "/:userId",
  [
    authMiddleware,
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  ],
  updateUserProfile,
);

// Get name history (GET /api/users/:userId/name-history) - PROTECTED
router.get("/:userId/name-history", authMiddleware, getNameHistory);

export default router;
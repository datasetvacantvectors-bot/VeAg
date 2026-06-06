import express from 'express';
import * as cropController from '../controllers/cropController.js';
import authMiddleware from '../config/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all crops
router.get('/', cropController.getAllCrops);

// Seed crops (development only)
router.post('/seed', cropController.seedCrops);

export default router;

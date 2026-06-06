import express from 'express';
import { searchProducts, trackSearch, trackClick } from '../controllers/productController.js';
import authMiddleware from '../config/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/search', searchProducts);
router.post('/track-search', trackSearch);
router.post('/track-click', trackClick);

export default router;

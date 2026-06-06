import express from 'express';
import { login, verifyToken, getAllProducts, addProduct, editProduct, deleteProduct, getSearchAnalytics, getClickAnalytics } from '../controllers/adminController.js';
import adminAuth from '../config/adminMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify', adminAuth, verifyToken);
router.get('/products', adminAuth, getAllProducts);
router.post('/products', adminAuth, addProduct);
router.put('/products/:productId', adminAuth, editProduct);
router.delete('/products/:productId', adminAuth, deleteProduct);
router.get('/analytics/searches', adminAuth, getSearchAnalytics);
router.get('/analytics/clicks', adminAuth, getClickAnalytics);

export default router;

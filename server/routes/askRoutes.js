import express from 'express';
import * as askController from '../controllers/askController.js';
import authMiddleware from '../config/authMiddleware.js';
import subscriptionMiddleware from '../config/subscriptionMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply strict subscription validation to all ask routes
router.use(subscriptionMiddleware);

// Get messages for a case (paginated)
router.get('/:caseId/messages', askController.getMessages);

// Send a message
router.post('/:caseId/messages', askController.sendMessage);

// Retry a failed message
router.post('/messages/:messageId/retry', askController.retryMessage);

export default router;

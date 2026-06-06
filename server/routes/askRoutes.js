import express from 'express';
import * as askController from '../controllers/askController.js';
import authMiddleware from '../config/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get messages for a case (paginated)
router.get('/:caseId/messages', askController.getMessages);

// Send a message
router.post('/:caseId/messages', askController.sendMessage);

// Retry a failed message
router.post('/messages/:messageId/retry', askController.retryMessage);

export default router;

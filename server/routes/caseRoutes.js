import express from 'express';
import * as caseController from '../controllers/caseController.js';
import authMiddleware from '../config/authMiddleware.js';
import subscriptionMiddleware from '../config/subscriptionMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply strict subscription validation to all case routes
router.use(subscriptionMiddleware);

// Create new case
router.post('/', caseController.createCase);

// Get all cases for a user
router.get('/user/:userId', caseController.getUserCases);

// Get single case by caseId
router.get('/:caseId', caseController.getCaseById);

// Process case with AI model
router.post('/:caseId/process', caseController.processCase);

// Get case result
router.get('/:caseId/result', caseController.getCaseResult);

// Get all treatment info for a case
router.get('/:caseId/treatment-info', caseController.getTreatmentInfo);

// Generate specific treatment info (treatment, causes, prevention)
router.post('/:caseId/treatment-info/:type', caseController.generateTreatmentInfo);

export default router;

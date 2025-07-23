const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/forms', formController.getForms);
router.get('/forms/:id', formController.getForm);
router.post('/forms/:id/submit', formController.submitForm);

// Admin-only routes
router.post('/forms', authenticateToken, isAdmin, formController.createForm);
router.get('/forms/:id/submissions', authenticateToken, isAdmin, formController.getSubmissions);
router.get('/forms/:id/submissions/csv', authenticateToken, isAdmin, formController.exportSubmissionsCSV);

module.exports = router;

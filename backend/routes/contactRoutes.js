const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const protect = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Public route (logged-in Devotees)
router.post('/', protect, contactController.sendContactEmail);

// Admin / Trustee protected routes
router.get('/enquiries', protect, checkRole('Trustee', 'Admin'), contactController.getEnquiries);
router.get('/enquiries/:id', protect, checkRole('Trustee', 'Admin'), contactController.getEnquiryById);
router.put('/enquiries/:id', protect, checkRole('Trustee', 'Admin'), contactController.updateEnquiryStatus);
router.delete('/enquiries/:id', protect, checkRole('Trustee', 'Admin'), contactController.deleteEnquiry);

module.exports = router;

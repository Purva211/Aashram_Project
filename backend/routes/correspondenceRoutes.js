const express = require('express');
const router = express.Router();
const correspondenceController = require('../controllers/correspondenceController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Middleware to check specific correspondence permissions
const requireCorrespondencePermission = (req, res, next) => {
  // If admin, allow
  if (req.user.role === 'Admin') return next();
  
  // Check trustee permissions
  if (req.user.role === 'Trustee') {
    const hasPerm = req.user.permissions?.some(p => p.module === 'Official Correspondence' && p.level === 'Manage');
    if (hasPerm) return next();
  }
  
  return res.status(403).json({ success: false, message: 'Forbidden: Requires Letterhead Management Permission' });
};

// Apply auth and permission middleware to all routes
router.use(protect);
router.use(authorizeRoles('Admin', 'Trustee'));
router.use(requireCorrespondencePermission);

router.post('/', correspondenceController.createLetter);
router.get('/', correspondenceController.getAllLetters);
router.get('/:id', correspondenceController.getLetterById);
router.put('/:id', correspondenceController.updateDraft);
router.post('/:id/generate', correspondenceController.generateOfficialPdf);
router.put('/:id/archive', correspondenceController.archiveLetter);
router.delete('/:id', correspondenceController.deleteLetter);
router.post('/:id/share', correspondenceController.recordShare);

module.exports = router;

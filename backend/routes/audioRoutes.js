const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');
const protect = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route for home page player
router.get('/active', audioController.getActiveTrack);

// Trustee only routes
router.use(protect);
router.use(role(['Trustee']));

router.post('/import-youtube', upload.single('thumbnail'), audioController.importFromYoutube);
router.post('/upload-direct', upload.fields([{ name: 'audioFile', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), audioController.uploadDirect);
router.get('/', audioController.getAllTracks);
router.put('/:id/active', audioController.setActiveTrack);
router.put('/:id', upload.single('thumbnail'), audioController.updateTrack);
router.delete('/:id', audioController.deleteTrack);

module.exports = router;

// routes/videoRoutes.js

const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');


// Route to find the best matching video
router.post('/find-matching-video', videoController.findMatchingVideo);

// Route to test extract video details
router.post('/test-extract', videoController.testExtract);

module.exports = router;

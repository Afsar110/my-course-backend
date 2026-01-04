const express = require('express');
const videoRoutes = require('./videoRoutes');
const aiRoutes = require('./aiRoutes');
const courseRoute = require('./courseRoute');
const authRoute = require('./authRoutes');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// Use the routes
router.use('/auth', authRoute);
router.use('/videos',authenticate, videoRoutes);
router.use('/ai',authenticate, aiRoutes);
router.use('/courses', authenticate, courseRoute);


module.exports = router;
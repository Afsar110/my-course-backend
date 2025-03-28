const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticate = require('../middleware/authMiddleware');

// Route to create a new course
router.post('/createCourse', courseController.createCompleteCourse);

module.exports = router;

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Route to create a new course
router.post('/create', courseController.createCompleteCourse);

module.exports = router;

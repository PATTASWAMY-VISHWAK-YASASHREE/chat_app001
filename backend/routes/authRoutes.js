const express = require('express');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { verifyToken, requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, requireAuth, getMe);
router.put('/profile', verifyToken, requireAuth, updateProfile);

module.exports = router;
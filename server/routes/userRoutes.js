const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/login', userController.login);
router.post('/register', authenticateToken, isAdmin, userController.register); // Only admins can register new users

module.exports = router;
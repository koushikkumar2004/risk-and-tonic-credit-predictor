const express = require('express');
const router = express.Router();
const { registerUser, authUser, authEmployee, getUserProfile, updateUserProfile, getUsers, updateUserByAdmin, updateUserPassword } = require('../controllers/authController');
const { protect, adminOrEmployee } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/employee-login', authEmployee);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updateUserPassword);
router.get('/users', protect, adminOrEmployee, getUsers);
router.put('/users/:id', protect, adminOrEmployee, updateUserByAdmin);

module.exports = router;

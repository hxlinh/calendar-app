const express = require('express');
const router = express.Router();
const { register, login, updateProfile, changePassword } = require('../app/controllers/authController');
const auth = require('../app/middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.put('/update-profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);

module.exports = router;
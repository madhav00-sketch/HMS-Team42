const express = require('express');
const router = express.Router();
const { getUsers, updateUserStatus, changePassword } = require('../controllers/usersController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, requireRole('admin', 'warden'), getUsers);
router.patch('/password', verifyToken, changePassword);
router.patch('/:id/status', verifyToken, requireRole('admin'), updateUserStatus);

module.exports = router;
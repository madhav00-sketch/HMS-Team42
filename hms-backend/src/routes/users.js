const express = require('express');
const router = express.Router();
const { getUsers, changePassword } = require('../controllers/usersController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, requireRole('admin', 'warden'), getUsers);
router.patch('/password', verifyToken, changePassword);

module.exports = router;
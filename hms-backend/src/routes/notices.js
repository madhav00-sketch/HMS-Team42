const express = require('express');
const router = express.Router();
const { getNotices, createNotice } = require('../controllers/noticesController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, getNotices);
router.post('/', verifyToken, requireRole('admin', 'warden'), createNotice);

module.exports = router;
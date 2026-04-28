const express = require('express');
const router = express.Router();
const { getComplaints, createComplaint, updateComplaint } = require('../controllers/complaintsController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, getComplaints);
router.post('/', verifyToken, requireRole('student'), createComplaint);
router.patch('/:id', verifyToken, requireRole('warden','admin'), updateComplaint);

module.exports = router;
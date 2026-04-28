const express = require('express');
const router = express.Router();
const { getRooms, getMyRoom, allocateRoom, vacateRoom } = require('../controllers/roomsController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, getRooms);
router.get('/my', verifyToken, requireRole('student'), getMyRoom);
router.post('/:id/allocate', verifyToken, requireRole('warden', 'admin'), allocateRoom);
router.post('/:id/vacate', verifyToken, requireRole('warden', 'admin'), vacateRoom);

module.exports = router;
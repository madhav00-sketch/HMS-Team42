const db = require('../config/db');

const getRooms = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*,
        GROUP_CONCAT(u.name ORDER BY u.name SEPARATOR ', ') AS student_name,
        GROUP_CONCAT(u.user_id ORDER BY u.name SEPARATOR ', ') AS student_uid,
        COUNT(ra.id) as occupants
      FROM rooms r
      LEFT JOIN room_allocations ra ON r.id = ra.room_id AND ra.is_active = TRUE
      LEFT JOIN users u ON ra.student_id = u.id
      GROUP BY r.id
      ORDER BY r.block, r.floor, r.room_number
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
const getMyRoom = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.* FROM rooms r
      JOIN room_allocations ra ON r.id = ra.room_id
      WHERE ra.student_id = ? AND ra.is_active = TRUE
    `, [req.user.id]);
    if (rows.length === 0)
      return res.status(404).json({ message: 'No room allocated.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
const allocateRoom = async (req, res) => {
  const { student_id } = req.body;
  const room_id = req.params.id;
  try {
    const [room] = await db.query('SELECT * FROM rooms WHERE id = ?', [room_id]);
    if (room.length === 0)
      return res.status(404).json({ message: 'Room not found.' });
    if (room[0].status === 'maintenance')
      return res.status(400).json({ message: 'Room is under maintenance.' });

    // Capacity based on room type
    const capacity = room[0].type === 'Single' ? 1
                   : room[0].type === 'Double' ? 2 : 3;

    const [current] = await db.query(
      'SELECT COUNT(*) as cnt FROM room_allocations WHERE room_id = ? AND is_active = TRUE',
      [room_id]
    );

    if (current[0].cnt >= capacity)
      return res.status(400).json({ message: `Room is full (${capacity} max).` });

    // Deactivate old allocation for this student
    await db.query(
      'UPDATE room_allocations SET is_active = FALSE, vacated_at = NOW() WHERE student_id = ? AND is_active = TRUE',
      [student_id]
    );

    await db.query(
      'INSERT INTO room_allocations (student_id, room_id, allocated_by) VALUES (?,?,?)',
      [student_id, room_id, req.user.id]
    );

    // Mark full only if at capacity
    const [after] = await db.query(
      'SELECT COUNT(*) as cnt FROM room_allocations WHERE room_id = ? AND is_active = TRUE',
      [room_id]
    );
    if (after[0].cnt >= capacity) {
      await db.query('UPDATE rooms SET status = "occupied" WHERE id = ?', [room_id]);
    }

    res.status(201).json({ message: 'Room allocated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};
const vacateRoom = async (req, res) => {
  const { student_uid } = req.body;
  const room_id = req.params.id;
  try {
    const [student] = await db.query('SELECT id FROM users WHERE user_id = ?', [student_uid]);
    if (student.length === 0)
      return res.status(404).json({ message: 'Student not found.' });
    const student_id = student[0].id;
    await db.query(
      'UPDATE room_allocations SET is_active = FALSE, vacated_at = NOW() WHERE student_id = ? AND room_id = ? AND is_active = TRUE',
      [student_id, room_id]
    );
    const [remaining] = await db.query(
      'SELECT COUNT(*) as cnt FROM room_allocations WHERE room_id = ? AND is_active = TRUE',
      [room_id]
    );
    if (remaining[0].cnt === 0) {
      await db.query('UPDATE rooms SET status = "available" WHERE id = ?', [room_id]);
    }
    res.json({ message: 'Room vacated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};
module.exports = { getRooms, getMyRoom, allocateRoom, vacateRoom };
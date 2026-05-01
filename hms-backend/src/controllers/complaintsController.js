const db = require('../config/db');

const generateTicketId = async () => {
  const [maxRow] = await db.query('SELECT MAX(CAST(SUBSTRING(ticket_id, 5) AS UNSIGNED)) AS maxid FROM complaints');
  const nextId = (maxRow[0].maxid || 0) + 1;
  return `TKT-${String(nextId).padStart(3, '0')}`;
};

const getComplaints = async (req, res) => {
  try {
    let query, params = [];
    if (req.user.role === 'student') {
      query = `
        SELECT c.*, r.room_number, u.name AS student_name, u.user_id AS student_uid
        FROM complaints c
        LEFT JOIN rooms r ON c.room_id = r.id
        JOIN users u ON c.student_id = u.id
        WHERE c.student_id = ?
        ORDER BY c.created_at DESC`;
      params = [req.user.id];
    } else {
      query = `
        SELECT c.*, r.room_number, u.name AS student_name, u.user_id AS student_uid, u.id AS student_db_id
        FROM complaints c
        LEFT JOIN rooms r ON c.room_id = r.id
        JOIN users u ON c.student_id = u.id
        ORDER BY c.created_at DESC`;
    }
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getComplaints error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

const createComplaint = async (req, res) => {
  const { category, description, priority } = req.body;
  if (!category || !description)
    return res.status(400).json({ message: 'Category and description required.' });

  try {
    const isRoomRequest = description.startsWith('ROOM REQUEST');
    let room_id = null;

    if (!isRoomRequest) {
      const [alloc] = await db.query(
        'SELECT room_id FROM room_allocations WHERE student_id = ? AND is_active = TRUE',
        [req.user.id]
      );
      if (alloc.length === 0)
        return res.status(400).json({ message: 'No room allocated to your account.' });
      room_id = alloc[0].room_id;
    }

    const ticket_id = await generateTicketId();

    if (room_id !== null) {
      await db.query(
        'INSERT INTO complaints (ticket_id, student_id, room_id, category, description, priority) VALUES (?,?,?,?,?,?)',
        [ticket_id, req.user.id, room_id, category, description, priority || 'High']
      );
    } else {
      // Room request — no room assigned yet, omit room_id so DB uses its default/null
      await db.query(
        'INSERT INTO complaints (ticket_id, student_id, category, description, priority) VALUES (?,?,?,?,?)',
        [ticket_id, req.user.id, category, description, priority || 'High']
      );
    }

    res.status(201).json({ message: 'Request submitted successfully.', ticket_id });
  } catch (err) {
    console.error('createComplaint error:', err.message, '| code:', err.code);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

const updateComplaint = async (req, res) => {
  const { status, room_id, student_db_id } = req.body;
  try {
    if (room_id && student_db_id) {
      const [room] = await db.query('SELECT * FROM rooms WHERE id = ?', [room_id]);
      if (room.length === 0)
        return res.status(404).json({ message: 'Room not found.' });

      const capacity = room[0].type === 'Single' ? 1
                     : room[0].type === 'Double' ? 2 : 3;

      const [current] = await db.query(
        'SELECT COUNT(*) as cnt FROM room_allocations WHERE room_id = ? AND is_active = TRUE',
        [room_id]
      );
      if (current[0].cnt >= capacity)
        return res.status(400).json({ message: `Room is full (max ${capacity}).` });

      await db.query(
        'UPDATE room_allocations SET is_active = FALSE, vacated_at = NOW() WHERE student_id = ? AND is_active = TRUE',
        [student_db_id]
      );

      await db.query(
        'INSERT INTO room_allocations (student_id, room_id, allocated_by) VALUES (?,?,?)',
        [student_db_id, room_id, req.user.id]
      );

      const [after] = await db.query(
        'SELECT COUNT(*) as cnt FROM room_allocations WHERE room_id = ? AND is_active = TRUE',
        [room_id]
      );
      const newStatus = after[0].cnt >= capacity ? 'occupied' : 'available';
      await db.query('UPDATE rooms SET status = ? WHERE id = ?', [newStatus, room_id]);
    }

    await db.query(
      'UPDATE complaints SET status = ? WHERE id = ?',
      [status || 'resolved', req.params.id]
    );

    res.json({ message: 'Done.' });
  } catch (err) {
    console.error('updateComplaint error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getComplaints, createComplaint, updateComplaint };
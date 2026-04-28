const bcrypt = require('bcryptjs');
const db = require('../config/db');

const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, user_id, name, email, role, status FROM users';
    let params = [];
    if (role) { query += ' WHERE role = ?'; params.push(role); }
    query += ' ORDER BY role, user_id';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// PATCH /api/users/password — change own password
const changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password)
    return res.status(400).json({ message: 'Both current and new password required.' });
  if (new_password.length < 6)
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0)
      return res.status(404).json({ message: 'User not found.' });
    const match = await bcrypt.compare(current_password, rows[0].password);
    if (!match)
      return res.status(401).json({ message: 'Current password is incorrect.' });
    const hash = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getUsers, changePassword };
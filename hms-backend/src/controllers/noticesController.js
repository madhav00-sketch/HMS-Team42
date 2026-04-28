const db = require('../config/db');

const getNotices = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.*, u.name AS posted_by_name
      FROM notices n JOIN users u ON n.posted_by = u.id
      ORDER BY n.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const createNotice = async (req, res) => {
  const { title, message, type } = req.body;
  if (!title || !message)
    return res.status(400).json({ message: 'Title and message required.' });
  try {
    await db.query(
      'INSERT INTO notices (title, message, type, posted_by) VALUES (?,?,?,?)',
      [title, message, type || 'general', req.user.id]
    );
    res.status(201).json({ message: 'Notice posted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getNotices, createNotice };
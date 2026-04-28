const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

async function fix() {
  const hash = await bcrypt.hash('password123', 10);
  await db.query('UPDATE users SET password = ?', [hash]);
  console.log('All passwords updated to password123');
  console.log('Hash:', hash);
  process.exit();
}

fix();
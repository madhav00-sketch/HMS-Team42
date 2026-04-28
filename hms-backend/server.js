const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) =>
  res.json({ status: 'HMS Backend running ✓' })
);

app.use('/api/auth',       require('./src/routes/auth'));
app.use('/api/complaints', require('./src/routes/complaints'));
app.use('/api/rooms',      require('./src/routes/rooms'));
app.use('/api/users',      require('./src/routes/users'));
app.use('/api/notices',    require('./src/routes/notices'));

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏠 HMS Backend running → http://localhost:${PORT}`);
});
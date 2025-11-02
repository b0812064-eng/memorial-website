const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ MySQL Connected');
});

// Routes
app.get('/memorials', (req, res) => {
  db.query('SELECT * FROM memorials ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/memorials/:id', (req, res) => {
  db.query('SELECT * FROM memorials WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(results[0]);
  });
});

app.post('/memorials', (req, res) => {
  const { name, birth, death, bio, photo } = req.body;
  const id = uuidv4();
  db.query('INSERT INTO memorials (id, name, birth, death, bio, photo) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, birth, death, bio, photo],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, birth, death, bio, photo });
    }
  );
});

app.delete('/memorials/:id', (req, res) => {
  db.query('DELETE FROM memorials WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

app.get('/memorials/search', (req, res) => {
  const q = req.query.q;
  db.query('SELECT * FROM memorials WHERE name LIKE ?', [`%${q}%`], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

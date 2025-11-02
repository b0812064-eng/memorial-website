const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'memorials_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected!');
});

// Tüm anıtlar getir
app.get('/memorials', (req, res) => {
  db.query('SELECT * FROM memorials ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Tek anıt getir (YENİ: detail.js için)
app.get('/memorials/:id', (req, res) => {
  db.query('SELECT * FROM memorials WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(results[0]);
  });
});

// Yeni ekle
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

// Sil
app.delete('/memorials/:id', (req, res) => {
  db.query('DELETE FROM memorials WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

// Arama
app.get('/memorials/search', (req, res) => {
  const q = req.query.q;
  db.query('SELECT * FROM memorials WHERE name LIKE ?', [`%${q}%`], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
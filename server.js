const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Mithun@2003',
  database: 'memories_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(sql, [username, password], (err, result) => {
    if (err) throw err;
    res.redirect('/login');
  });
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, result) => {
    if (err) throw err;
    if (result.length ==1) {
      res.redirect(`/home?user=${username}`);
    } else {
      res.send('Invalid credentials');
    }
  });
});

app.get('/home', (req, res) => {
  const { user } = req.query;
  const sql = 'SELECT * FROM memories WHERE user_id = (SELECT id FROM users WHERE username = ?)';
  db.query(sql, [user], (err, memories) => {
    if (err) throw err;
    res.render('home', { user, memories });
  });
});

app.post('/upload', upload.single('image'), (req, res) => {
  const { user, text } = req.body;
  const imagePath = `/uploads/${req.file.filename}`;
  const sql = 'INSERT INTO memories (user_id, image_path, text) VALUES ((SELECT id FROM users WHERE username = ?), ?, ?)';
  db.query(sql, [user, imagePath, text], (err, result) => {
    if (err) throw err;
    res.redirect(`/home?user=${user}`);
  });
});

app.post('/delete', (req, res) => {
  const { id, user } = req.body;
  const sql = 'DELETE FROM memories WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.redirect(`/home?user=${user}`);
  });
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});

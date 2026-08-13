const express = require('express');
const router = express.Router();
const db = require('../models/db');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const settings = require('../models/settings');

// Upload config
const uploadDir = path.join(__dirname, '../../public/uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ensure upload dir
const fs = require('fs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Admin login
router.get('/login', (req, res) => {
  res.render('admin/login');
});
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const d = db.getDb();
  d.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) return res.status(500).send('DB error');
    if (!row) return res.render('admin/login', { error: 'Invalid credentials' });
    bcrypt.compare(password, row.password_hash).then(match => {
      if (!match) return res.render('admin/login', { error: 'Invalid credentials' });
      req.session.user = { id: row.id, username: row.username };
      res.redirect('/admin');
      d.close();
    });
  });
});

// Middleware to protect admin routes
function requireAdmin(req, res, next){
  if (!req.session.user) return res.redirect('/admin/login');
  next();
}

// Admin dashboard
router.get('/', requireAdmin, (req, res) => {
  const d = db.getDb();
  d.all('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 50', (err, rows) => {
    if (err) return res.status(500).send('DB error');
    res.render('admin/dashboard', { bookings: rows });
    d.close();
  });
});

// Site settings editor
router.get('/site-settings', requireAdmin, async (req, res) => {
  try {
    const site_name = settings.get('site_name', process.env.SITE_NAME || 'Haven Trail');
    const welcome_text = settings.get('welcome_text', '');
    const site_logo = settings.get('site_logo', '');
    res.render('admin/settings', { site_name, welcome_text, site_logo });
  } catch (err) {
    res.status(500).send('Failed to load settings');
  }
});

router.post('/site-settings', requireAdmin, upload.single('logo'), async (req, res) => {
  try {
    const { site_name, welcome_text } = req.body;
    await settings.set('site_name', site_name || process.env.SITE_NAME || 'Haven Trail');
    await settings.set('welcome_text', welcome_text || '');
    if (req.file) {
      const logoPath = `/uploads/${req.file.filename}`;
      await settings.set('site_logo', logoPath);
    }
    // reload settings into memory
    await settings.load();
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to save settings');
  }
});

// Rooms management
router.get('/rooms/new', requireAdmin, (req, res) => res.render('admin/rooms_form', { room: {} }));
router.post('/rooms', requireAdmin, upload.single('image'), (req, res) => {
  const { title, type, description, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const d = db.getDb();
  d.run('INSERT INTO rooms (title,type,description,price,image) VALUES (?,?,?,?,?)', [title,type,description,price,image], (err) => {
    if (err) return res.status(500).send('DB error');
    res.redirect('/admin/rooms');
    d.close();
  });
});

router.get('/rooms', requireAdmin, (req, res) => {
  const d = db.getDb();
  d.all('SELECT * FROM rooms', (err, rows) => {
    if (err) return res.status(500).send('DB error');
    res.render('admin/rooms', { rooms: rows });
    d.close();
  });
});

router.get('/rooms/:id/edit', requireAdmin, (req, res) => {
  const d = db.getDb();
  d.get('SELECT * FROM rooms WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).send('DB error');
    res.render('admin/rooms_form', { room: row });
    d.close();
  });
});

router.post('/rooms/:id', requireAdmin, upload.single('image'), (req, res) => {
  const { title, type, description, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const d = db.getDb();
  if (image) {
    d.run('UPDATE rooms SET title=?,type=?,description=?,price=?,image=? WHERE id=?', [title,type,description,price,image,req.params.id], (err) => {
      if (err) return res.status(500).send('DB error');
      res.redirect('/admin/rooms'); d.close();
    });
  } else {
    d.run('UPDATE rooms SET title=?,type=?,description=?,price=? WHERE id=?', [title,type,description,price,req.params.id], (err) => {
      if (err) return res.status(500).send('DB error');
      res.redirect('/admin/rooms'); d.close();
    });
  }
});

module.exports = router;

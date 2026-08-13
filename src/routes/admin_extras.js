const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../models/db');
const settings = require('../models/settings');
const multer = require('multer');
const bcrypt = require('bcrypt');

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

// Admin auth middleware
function requireAdmin(req, res, next){
  if (!req.session.user) return res.redirect('/admin/login');
  next();
}

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// Change password
router.get('/change-password', requireAdmin, (req, res) => {
  res.render('admin/change_password');
});
router.post('/change-password', requireAdmin, (req, res) => {
  const { current_password, new_password } = req.body;
  const d = db.getDb();
  d.get('SELECT * FROM users WHERE id = ?', [req.session.user.id], (err, row) => {
    if (err) return res.status(500).send('DB error');
    bcrypt.compare(current_password, row.password_hash).then(match => {
      if (!match) return res.render('admin/change_password', { error: 'Current password incorrect' });
      bcrypt.hash(new_password, 10).then(hash => {
        d.run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, row.id], (err) => {
          d.close();
          if (err) return res.status(500).send('DB error');
          res.redirect('/admin');
        });
      });
    });
  });
});

// Booking detail and actions
router.get('/bookings/:id', requireAdmin, (req, res) => {
  const d = db.getDb();
  d.get('SELECT b.*, r.title as room_title FROM bookings b LEFT JOIN rooms r ON r.id=b.room_id WHERE b.id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).send('DB error');
    if (!row) return res.status(404).send('Booking not found');
    res.render('admin/booking_detail', { booking: row });
    d.close();
  });
});

router.post('/bookings/:id/action', requireAdmin, (req, res) => {
  const { action } = req.body;
  const id = req.params.id;
  const d = db.getDb();
  if (action === 'mark_paid') {
    d.run('UPDATE bookings SET paid = 1 WHERE id = ?', [id], (err) => { d.close(); if (err) return res.status(500).send('DB error'); res.redirect('/admin'); });
  } else if (action === 'mark_unpaid') {
    d.run('UPDATE bookings SET paid = 0 WHERE id = ?', [id], (err) => { d.close(); if (err) return res.status(500).send('DB error'); res.redirect('/admin'); });
  } else if (action === 'cancel') {
    d.run('DELETE FROM bookings WHERE id = ?', [id], (err) => { d.close(); if (err) return res.status(500).send('DB error'); res.redirect('/admin'); });
  } else {
    d.close();
    res.status(400).send('Unknown action');
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../models/db');

// Home / Welcome
router.get('/', (req, res) => {
  res.render('index', { welcomeText: `Welcome to ${res.locals.siteName}. We are happy to host you in the Maldives. Add a bio in the admin panel.` });
});

// Rooms list
router.get('/rooms', (req, res) => {
  const d = db.getDb();
  d.all('SELECT * FROM rooms', (err, rows) => {
    if (err) return res.status(500).send('DB error');
    res.render('rooms', { rooms: rows });
    d.close();
  });
});

// Room detail + booking form
router.get('/rooms/:id', (req, res) => {
  const d = db.getDb();
  d.get('SELECT * FROM rooms WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).send('DB error');
    if (!row) return res.status(404).send('Room not found');
    res.render('room', { room: row });
    d.close();
  });
});

// Handle booking post
router.post('/book', (req, res) => {
  const { room_id, name, email, phone, checkin, checkout, nights, total } = req.body;
  const d = db.getDb();
  d.run('INSERT INTO bookings (room_id,name,email,phone,checkin,checkout,nights,total) VALUES (?,?,?,?,?,?,?,?)',
    [room_id, name, email, phone, checkin, checkout, nights || 1, total || 0], function(err){
      if (err) return res.status(500).send('DB error');
      // redirect to a separate checkout/payment page as requested
      res.redirect(`/payments/checkout?booking_id=${this.lastID}`);
      d.close();
    });
});

module.exports = router;

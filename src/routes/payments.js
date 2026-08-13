const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Checkout page after booking
router.get('/checkout', (req, res) => {
  const booking_id = req.query.booking_id;
  if (!booking_id) return res.status(400).send('Missing booking id');
  const d = db.getDb();
  d.get('SELECT b.*, r.title as room_title FROM bookings b LEFT JOIN rooms r ON r.id=b.room_id WHERE b.id = ?', [booking_id], (err, row) => {
    if (err) return res.status(500).send('DB error');
    if (!row) return res.status(404).send('Booking not found');
    // Render a payment page where user can choose Google Pay or bank gateways (placeholders)
    res.render('checkout', { booking: row });
    d.close();
  });
});

// Placeholder for Google Pay success webhook (demo only)
router.post('/googlepay/success', (req, res) => {
  const { booking_id } = req.body;
  const d = db.getDb();
  d.run('UPDATE bookings SET paid = 1 WHERE id = ?', [booking_id], (err) => {
    if (err) return res.status(500).send('DB error');
    res.json({ success: true });
    d.close();
  });
});

// Placeholders for bank gateways (BML/MIB/SIB). Implement with merchant API details later.
router.post('/bank/bml', (req, res) => {
  // TODO: integrate BML with your credentials
  res.json({ success: false, message: 'BML integration placeholder. Add credentials in .env and implement API calls.' });
});
router.post('/bank/mib', (req, res) => {
  res.json({ success: false, message: 'MIB integration placeholder.' });
});
router.post('/bank/sib', (req, res) => {
  res.json({ success: false, message: 'SIB integration placeholder.' });
});

module.exports = router;

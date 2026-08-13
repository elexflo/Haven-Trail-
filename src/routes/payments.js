const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../models/db');
const mailer = require('../utils/mailer');

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

// Old form POST success (keeps compatibility)
router.post('/googlepay/success', (req, res) => {
  const { booking_id } = req.body;
  const d = db.getDb();
  d.run('UPDATE bookings SET paid = 1 WHERE id = ?', [booking_id], async (err) => {
    if (err) return res.status(500).send('DB error');
    // send confirmation email if configured
    d.get('SELECT b.*, r.title as room_title FROM bookings b LEFT JOIN rooms r ON r.id=b.room_id WHERE b.id = ?', [booking_id], async (rowErr, bookingRow) => {
      if (!rowErr && bookingRow) {
        try { await mailer.sendBookingConfirmation(bookingRow); } catch(e){ console.error('Email error', e); }
      }
    });
    res.json({ success: true });
    d.close();
  });
});

// New endpoint to process Google Pay payment data from client
router.post('/googlepay/process', (req, res) => {
  const { booking_id, paymentData } = req.body;
  if (!booking_id || !paymentData) return res.status(400).json({ success: false, message: 'Missing data' });

  // In production: validate paymentData and send to payment gateway for capture/verification.
  // For demo: mark booking as paid and return success. Send confirmation email if possible.
  const d = db.getDb();
  d.run('UPDATE bookings SET paid = 1 WHERE id = ?', [booking_id], function(err) {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    // fetch booking to send email
    d.get('SELECT b.*, r.title as room_title FROM bookings b LEFT JOIN rooms r ON r.id=b.room_id WHERE b.id = ?', [booking_id], async (rowErr, bookingRow) => {
      if (!rowErr && bookingRow) {
        try { await mailer.sendBookingConfirmation(bookingRow); } catch(e){ console.error('Email error', e); }
      }
      d.close();
      return res.json({ success: true });
    });
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

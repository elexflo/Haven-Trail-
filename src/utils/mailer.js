const nodemailer = require('nodemailer');

let transporter = null;

function createTransporter(){
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
  return transporter;
}

async function sendBookingConfirmation(booking){
  const t = createTransporter();
  if (!t) return false; // SMTP not configured
  const from = process.env.FROM_EMAIL || 'no-reply@haventrail.example';
  const to = booking.email;
  const subject = `Booking confirmation #${booking.id} - ${booking.room_title || ''}`;
  const text = `Dear ${booking.name},\n\nThank you for your booking. Reference: ${booking.id}\nRoom: ${booking.room_title}\nTotal: $${booking.total}\n\nWe will contact you with further details.\n\nRegards,\n${process.env.SITE_NAME || 'Haven Trail'}`;

  await t.sendMail({ from, to, subject, text });
  return true;
}

module.exports = { sendBookingConfirmation };

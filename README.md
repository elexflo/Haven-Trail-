# Haven Trail Maldives - Booking site scaffold

This branch contains a scaffolded Node.js + Express app for a hotel/room booking website with an admin panel. It includes:

- Public pages: welcome, room listings, room detail, booking flow, checkout (payment page)
- Admin panel: login, manage rooms, view bookings, upload images, site settings
- SQLite database (zero-config)
- Google Pay demo integration placeholder and endpoints for adding bank gateways (BML/MIB/SIB)
- Dockerfile + docker-compose for easy local testing
- Mailing support (optional) using SMTP - configure via environment variables

Quick start (local):

1. Copy .env.example to .env and edit values.
2. npm install
3. npm run seed  # optional - seeds sample rooms into the DB
4. npm run dev (requires nodemon) or npm start
5. Open http://localhost:3000

Admin login: use ADMIN_USER and ADMIN_PASS from .env (the first run seeds admin account).

Email (optional):
- To enable booking confirmation emails, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL in your .env.
- The app will only attempt to send email if SMTP_HOST is present.

Payments:
- Google Pay and bank gateways are left as placeholders. Add merchant credentials and webhook endpoints when available.

Security notes (before production):
- Change ADMIN_PASS and SESSION_SECRET.
- Use HTTPS and a real session store (Redis) in production.
- Add CSRF protection and input validation.


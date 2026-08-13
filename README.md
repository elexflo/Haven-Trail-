# Haven Trail Maldives - Booking site scaffold

This branch contains a scaffolded Node.js + Express app for a hotel/room booking website with an admin panel. It includes:

- Public pages: welcome, room listings, room detail, booking flow, checkout (payment page)
- Admin panel: login, manage rooms, view bookings, upload images
- SQLite database (zero-config)
- Google Pay demo integration placeholder and endpoints for adding bank gateways (BML/MIB/SIB)
- Dockerfile + docker-compose for easy local testing

Quick start (local):

1. Copy .env.example to .env and edit values.
2. npm install
3. npm run dev (requires nodemon) or npm start
4. Open http://localhost:3000

Admin login: use ADMIN_USER and ADMIN_PASS from .env (the first run seeds admin account).

Notes: Payment gateways for banks are left as placeholders; add merchant credentials and webhook endpoints when available.

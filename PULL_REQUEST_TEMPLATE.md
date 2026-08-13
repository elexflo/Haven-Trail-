Title: Add full booking website scaffold, admin panel, site settings, Google Pay demo, and email support

Description:
This PR adds a complete scaffold for the Haven Trail Maldives booking website. Main features:

- Node.js + Express + EJS application with SQLite (zero-config) for quick local testing.
- Public pages: welcome (editable), rooms listing, room detail, booking flow, and a dedicated checkout/payment page.
- Admin panel with authentication, site settings (site name, welcome/bio, logo upload), CRUD for rooms, booking list and detail pages, password change, logout, and basic booking actions (mark paid/cancel).
- File uploads stored in public/uploads and a small upload handler using multer.
- Payment placeholders and demo: Google Pay client-side demo (TEST) and server-side placeholder endpoints for BML, MIB, SIB. The Google Pay demo uses client JS to obtain paymentData and posts it to the server; production tokenization/capture is left to be configured with your payment gateway later.
- Email support via nodemailer: booking confirmation emails will be sent if SMTP env vars are configured.
- Dockerfile and docker-compose for local development; sample seed script to create example rooms.

Notes:
- Payment gateway integrations for banks and a production Google Pay integration are intentionally left as placeholders; provide merchant credentials and API docs later and I will implement them.
- Security and production hardening are required before deployment (session store, HTTPS, CSRF, input validation, upload limits, etc.).

Files changed (high level):
- server.js, package.json, README.md, Dockerfile, docker-compose.yml
- src/models: db.js, settings.js
- src/routes: public.js, admin.js, admin_extras.js, payments.js
- src/utils: mailer.js
- views/: EJS templates for public and admin UIs (index, rooms, room, checkout, admin pages)
- public/: CSS, JS (checkout.js for Google Pay demo), uploads directory
- scripts/seed_rooms.js

----

Run & test steps (inside PR description):
1. Checkout branch: git fetch && git checkout feature/booking-site-scaffold
2. Copy .env.example to .env and set ADMIN_PASS and SESSION_SECRET
3. npm install
4. npm run seed (optional) to create sample rooms
5. npm run dev
6. Open http://localhost:3000

Security reminders and production checklist included in the README.

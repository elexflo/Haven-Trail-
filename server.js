const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data dir
if (!fs.existsSync(path.join(__dirname, 'data'))){
  fs.mkdirSync(path.join(__dirname, 'data'));
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
}));

// Initialize DB
const db = require('./src/models/db');
db.init();

// Settings loader
const settings = require('./src/models/settings');

(async () => {
  try {
    await settings.load();

    // Make site settings available to views on each request
    app.use((req, res, next) => {
      res.locals.siteName = settings.get('site_name', process.env.SITE_NAME || 'Haven Trail');
      res.locals.welcomeText = settings.get('welcome_text', `Welcome to ${res.locals.siteName}.`);
      res.locals.siteLogo = settings.get('site_logo', '');
      res.locals.currentUser = req.session.user || null;
      next();
    });

    // Routes
    const publicRoutes = require('./src/routes/public');
    const adminRoutes = require('./src/routes/admin');
    const paymentRoutes = require('./src/routes/payments');

    app.use('/', publicRoutes);
    app.use('/admin', adminRoutes);
    app.use('/payments', paymentRoutes);

    app.listen(PORT, () => {
      console.log(`${res.locals.siteName || 'Haven Trail'} listening on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('Failed to load settings or start server', err);
    process.exit(1);
  }
})();

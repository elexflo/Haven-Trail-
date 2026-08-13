const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_NAME = process.env.SITE_NAME || 'Haven Trail';

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

// Make site name available to views
app.use((req, res, next) => {
  res.locals.siteName = SITE_NAME;
  res.locals.currentUser = req.session.user || null;
  next();
});

// Initialize DB
const db = require('./src/models/db');
db.init();

// Routes
const publicRoutes = require('./src/routes/public');
const adminRoutes = require('./src/routes/admin');
const paymentRoutes = require('./src/routes/payments');

app.use('/', publicRoutes);
app.use('/admin', adminRoutes);
app.use('/payments', paymentRoutes);

app.listen(PORT, () => {
  console.log(`${SITE_NAME} listening on http://localhost:${PORT}`);
});

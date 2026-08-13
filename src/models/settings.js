const db = require('./db');

let cache = {};

function load(){
  return new Promise((resolve, reject) => {
    const d = db.getDb();
    d.all('SELECT key, value FROM settings', (err, rows) => {
      if (err) { d.close(); return reject(err); }
      rows.forEach(r => cache[r.key] = r.value);
      d.close();
      resolve();
    });
  });
}

function get(key, fallback){
  if (typeof cache[key] !== 'undefined') return cache[key];
  return fallback;
}

function set(key, value){
  return new Promise((resolve, reject) => {
    const d = db.getDb();
    d.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)', [key, value], (err) => {
      if (err) { d.close(); return reject(err); }
      cache[key] = value;
      d.close();
      resolve();
    });
  });
}

module.exports = { load, get, set };

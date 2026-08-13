const db = require('./src/models/db');

const sampleRooms = [
  { title: 'Ocean View Suite', type: 'Hotel', description: 'Spacious suite with ocean views.', price: 250.00 },
  { title: 'Garden Bungalow', type: 'Daily Rent', description: 'Cozy bungalow near the garden.', price: 120.00 },
  { title: 'Beachfront Villa', type: 'Hotel', description: 'Private villa on the beach.', price: 400.00 }
];

function seed(){
  const d = db.getDb();
  sampleRooms.forEach(r => {
    d.run('INSERT INTO rooms (title,type,description,price) VALUES (?,?,?,?)', [r.title, r.type, r.description, r.price]);
  });
  d.close();
  console.log('Seeded sample rooms');
}

if (require.main === module) seed();

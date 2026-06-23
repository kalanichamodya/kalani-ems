require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const db = mongoose.connection.db;
    await db.collection('attendances').dropIndexes();
    console.log('Indexes dropped successfully!');
  } catch (err) {
    console.log('Error:', err.message);
  }
  process.exit(0);
});
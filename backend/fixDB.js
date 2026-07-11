const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aashram').then(async () => {
  const db = mongoose.connection.db;
  const result = await db.collection('receiptarchives').updateMany(
    { generatedByModel: 'User' },
    { $set: { generatedByModel: 'Devotee' } }
  );
  console.log('Fixed ' + result.modifiedCount + ' records');
  process.exit(0);
}).catch(console.error);

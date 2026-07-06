const mongoose = require('mongoose');

const uri = 'mongodb+srv://gurumurtikolekarmaharaj44_db_user:Sonali1008@cluster0.ynwfmrh.mongodb.net/temple_management?appName=Cluster0';

async function run() {
  try {
    await mongoose.connect(uri);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:");
    collections.forEach(c => console.log(c.name));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

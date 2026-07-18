const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://kolekarmaraj11:L0K8iV57lXl5o1o0@cluster0.ynwfmrh.mongodb.net/AashramDb?retryWrites=true&w=majority&appName=Cluster0')
.then(async () => {
  const Devotee = require('./models/Devotee');
  const Donation = require('./models/Donation');
  
  const dev = await Devotee.findOne({ devoteeId: 'DEV-000003' }) || await Devotee.findOne({ name: /Purva/i });
  console.log('Devotee:', dev ? dev.name + ' | ' + dev.mobile + ' | ' + dev.email + ' | ' + dev._id : 'Not found');
  
  if (dev) {
    const dons = await Donation.find({ $or: [{ userId: dev._id }, { email: dev.email }, { phone: dev.mobile }, { donorName: new RegExp(dev.name, 'i') }] });
    console.log('Donations:', dons.map(d => ({ ref: d.donationReference, name: d.donorName, email: d.email, phone: d.phone, userId: d.userId })));
  }
  
  process.exit(0);
})
.catch(console.error);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const trusteeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  designation: { type: String, required: true },
  address: { type: String, required: true },
  aadhaar: { type: String },
  profilePhoto: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: "Trustee" },
  systemRole: { type: String, default: "Trust Member" },
  status: { type: String, default: "Active", enum: ["Active", "Inactive"] },
  permissions: {
    type: [{
      module: { type: String, required: true },
      level: { type: String, enum: ['View', 'Manage'], required: true }
    }],
    default: [
      { module: 'Dashboard', level: 'View' },
      { module: 'Devotees', level: 'View' },
      { module: 'Donations', level: 'View' },
      { module: 'Events', level: 'View' },
      { module: 'Announcements', level: 'Manage' },
      { module: 'Branches', level: 'View' },
      { module: 'Documents', level: 'View' },
      { module: 'Annadan', level: 'View' },
      { module: 'Sansthan Updates', level: 'View' },
      { module: 'Gallery', level: 'View' },
      { module: 'Monastery History', level: 'View' },
      { module: 'Lineage', level: 'View' },
      { module: 'Accountants', level: 'View' }
    ]
  }
}, { timestamps: true });

trusteeSchema.pre("save", async function() {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

trusteeSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Trustee", trusteeSchema);

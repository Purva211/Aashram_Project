const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const devoteeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, default: "Devotee" },
  address: { type: String },
  profilePhoto: { type: String },
  registrationDate: { type: Date, default: Date.now }
}, { timestamps: true });

devoteeSchema.pre("save", async function() {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

devoteeSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Devotee", devoteeSchema);

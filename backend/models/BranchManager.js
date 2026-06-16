const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const branchManagerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  managerId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  password: { type: String, required: true },
  role: { type: String, default: "BranchManager" },
  profilePhoto: { type: String, default: "" }
}, { timestamps: true });

branchManagerSchema.pre("save", async function() {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

branchManagerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("BranchManager", branchManagerSchema);

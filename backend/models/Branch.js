const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  contact: { type: String },
  description: { type: String },
  image: { type: String },
  cctvUrl: { type: String },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: "BranchManager" },
  members: [{
    name: { type: String, required: true },
    contact: { type: String },
    email: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Branch", branchSchema);

const mongoose = require("mongoose");

const sequenceSchema = new mongoose.Schema({
  sequenceName: {
    type: String,
    required: true,
    unique: true
  },
  currentValue: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Sequence", sequenceSchema);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const documentAdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "document_admin"
  },
  contactNo: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },
  profilePhoto: {
    type: String,
    default: ""
  }
}, { timestamps: true });

// Hash password before saving
documentAdminSchema.pre("save", async function() {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
documentAdminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("DocumentAdmin", documentAdminSchema);

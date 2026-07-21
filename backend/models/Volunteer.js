const mongoose = require("mongoose");
const Sequence = require("./Sequence");

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: true },
  role: { type: String, default: "Volunteer" },
  
  volunteerId: { type: String, unique: true, sparse: true },
  
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
  dob: { type: Date },
  aadhaar: { type: String },
  bloodGroup: { type: String },
  maritalStatus: { type: String, enum: ["Single", "Married", "Divorced", "Widowed", "Separated"], default: "Single" },
  
  address: { type: String },
  village: { type: String },
  taluka: { type: String },
  district: { type: String },
  state: { type: String },
  city: { type: String },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", index: true },
  profilePhoto: { type: String },
  registrationDate: { type: Date, default: Date.now },

  isDeleted: { type: Boolean, default: false, index: true }
}, { timestamps: true });

volunteerSchema.pre("validate", async function() {
  if (!this.volunteerId) {
    const seq = await Sequence.findOneAndUpdate(
      { sequenceName: "volunteerId" },
      { $inc: { currentValue: 1 } },
      { returnDocument: "after", upsert: true }
    );
    this.volunteerId = `VOL-${seq.currentValue.toString().padStart(6, "0")}`;
  }
});

module.exports = mongoose.model("Volunteer", volunteerSchema);

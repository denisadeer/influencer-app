const mongoose = require("mongoose");

const businessProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  website: String,
  igProfile: String,
  fbProfile: String,
  ttProfile: String,
  bio: String,
  location: String,
  businessField: String,
  photoUrl: String,
});

module.exports = mongoose.model("BusinessProfile", businessProfileSchema);


const mongoose = require("mongoose");

const influencerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: String,
  igNickname: String,
  ttNickname: String,
  fbNickname: String,
  gender: String,
  age: Number,
  location: String,
  interests: String,
  cooperationType: [String], // např. ["bartr", "odměna"]
  igFollowers: Number,
  ttFollowers: Number,
  fbFollowers: Number,
  bio: String,
  photoUrl: String,
});

// ✅ Zabráníme chybě OverwriteModelError:
module.exports = mongoose.models.InfluencerProfile || mongoose.model("InfluencerProfile", influencerProfileSchema);

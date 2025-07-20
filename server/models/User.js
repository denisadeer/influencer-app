const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, "Neplatný formát e-mailu"],
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ['admin', 'business', 'influencer'],
    required: true,
  },

  registrationIp: {
    type: String,
    required: true,
  },

  emailVerified: {
    type: Boolean,
    default: false,
  },

  emailVerificationToken: {
    type: String,
    default: null,
  },

  resetPasswordToken: {
    type: String,
    default: null,
  },

  resetPasswordExpires: {
    type: Date,
    default: null,
  },

  // 🧾 Předplatné
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'pro', 'manual'], // ← přidáno 'manual'
    default: 'free',
  },

  subscriptionStartDate: {
    type: Date,
    default: Date.now,
  },

  subscriptionCancelAt: {
    type: Date,
    default: null, // ← pro rušení předplatného přes Stripe i manuálně
  },

  allowedContacts: {
    type: Number,
    default: 0,
  },

  contactsUsedThisMonth: {
    type: Number,
    default: 0,
  },

  freePlanUsed: {
    type: Boolean,
    default: false,
  },

  // ✅ Seznam již kontaktovaných influencerů
  contactedInfluencers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InfluencerProfile",
    },
  ],
});

module.exports = mongoose.model('User', userSchema);

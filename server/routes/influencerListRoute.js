// server/routes/influencerListRoute.js
const express = require("express");
const router = express.Router();
const InfluencerProfile = require("../models/InfluencerProfile");

router.get("/", async (req, res) => {
  try {
    const influencers = await InfluencerProfile.find({}, {
      location: 1,
      bio: 1,
      interests: 1,
      age: 1,
      gender: 1,
    });
    res.json({ influencers });
  } catch (err) {
    console.error("❌ Chyba při získávání influencerů:", err);
    res.status(500).json({ message: "Chyba serveru." });
  }
});

module.exports = router;

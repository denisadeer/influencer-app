const express = require("express");
const router = express.Router();
const User = require("../models/User");
const BusinessProfile = require("../models/BusinessProfile");

// GET /api/public/business/:id
router.get("/business/:id", async (req, res) => {
  try {
    console.log("🔍 Načítám veřejný profil pro ID:", req.params.id);

    const user = await User.findById(req.params.id).select("username role");

    if (!user) {
      console.log("❌ Uživatel neexistuje.");
      return res.status(404).json({ message: "Podnik nenalezen" });
    }

    if (user.role !== "business") {
      console.log(`❌ Uživatel má roli '${user.role}', ne 'business'.`);
      return res.status(404).json({ message: "Není podnik" });
    }

    const profile = await BusinessProfile.findOne({ userId: req.params.id });

    if (!profile) {
      console.log("❌ Nebyl nalezen BusinessProfile.");
      return res.status(404).json({ message: "Podnik nemá veřejný profil" });
    }

    const publicData = {
      name: profile.name,
      photoUrl: profile.photoUrl,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      igProfile: profile.igProfile,
      fbProfile: profile.fbProfile,
      ttProfile: profile.ttProfile,
      businessField: profile.businessField,
    };

    console.log("✅ Posílám veřejný profil podniku:", publicData);

    res.json(publicData);
  } catch (error) {
    console.error("❌ Chyba při získávání veřejného profilu podniku:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

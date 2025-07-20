const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const InfluencerProfile = require("../models/InfluencerProfile");
const User = require("../models/User");
const authenticateToken = require("../middleware/authenticateToken");
const checkSubscriptionStatus = require("../middleware/checkSubscriptionStatus");
const resetContactsIfNeeded = require("../utils/resetContactsIfNeeded");

// Vytvoření složky uploads, pokud neexistuje
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Nastavení úložiště pro fotky
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Detail influencera – pouze pro podniky, které jej kontaktovaly
// Detail influencera – pouze pro podniky, které jej kontaktovaly
router.get("/profile/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "business") {
      return res.status(403).json({ message: "Přístup zamítnut. Jen pro podniky." });
    }

    const business = await User.findById(req.user.userId);
    if (!business) {
      return res.status(401).json({ message: "Podnik nenalezen." });
    }

    const influencerId = req.params.id;

    if (!business.contactedInfluencers || !business.contactedInfluencers.includes(influencerId)) {
      return res.status(403).json({ message: "Tento influencer nebyl vámi kontaktován." });
    }

    // 🔧 Populuj userId
    const profile = await InfluencerProfile.findById(influencerId).populate("userId", "_id");

    if (!profile) {
      return res.status(404).json({ message: "Profil influencera nenalezen." });
    }

    // ✨ Přidáme čistě userId bez celé reference
    const resultProfile = {
      ...profile.toObject(),
      userId: profile.userId?._id?.toString() || null,
    };

    res.json({ profile: resultProfile });
  } catch (err) {
    console.error("Chyba při načítání detailu influencera:", err);
    res.status(500).json({ message: "Chyba serveru." });
  }
});


// Uložit nebo aktualizovat influencer profil vč. fotky
router.post("/profile", authenticateToken, upload.single("photo"), async (req, res) => {
  try {
    const { userId } = req.user;

    const profileData = {
      ...req.body,
      age: Number(req.body.age),
      igFollowers: Number(req.body.igFollowers),
      ttFollowers: Number(req.body.ttFollowers),
      fbFollowers: Number(req.body.fbFollowers),
      cooperationType: req.body.cooperationType
        ? Array.isArray(req.body.cooperationType)
          ? req.body.cooperationType
          : req.body.cooperationType.split(",")
        : [],
    };

    if (req.file) {
      console.log("📸 Fotka byla nahrána:", req.file.filename);
      profileData.photoUrl = `/uploads/${req.file.filename}`;
      } else {
  console.log("⚠️ Žádná fotka nedorazila.");
    }
console.log("🔍 Co ukládám do Mongo:", profileData);

    const existing = await InfluencerProfile.findOne({ userId });

    if (existing) {
  // Pokud není nový soubor, zachováme původní photoUrl
  if (!req.file && existing.photoUrl) {
    profileData.photoUrl = existing.photoUrl;
  }

  const updated = await InfluencerProfile.findOneAndUpdate(
    { userId },
    profileData,
    { new: true }
  );
  return res.json({ message: "Profil aktualizován", profile: updated });
}
 else {
      const newProfile = new InfluencerProfile({ userId, ...profileData });
      await newProfile.save();
      return res.json({ message: "Profil vytvořen", profile: newProfile });
    }
  } catch (error) {
    console.error("Chyba serveru:", error);
    res.status(500).json({ error: "Chyba při ukládání profilu" });
  }
});
// ✅ Vrátit profil influencera (např. pro dashboard)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const profile = await InfluencerProfile.findOne({ userId: req.user.userId });

    if (!profile) {
      return res.status(404).json({ message: "Profil nenalezen" });
    }

    res.json({ profile });
  } catch (error) {
    console.error("❌ Chyba při načítání profilu:", error);
    res.status(500).json({ message: "Chyba serveru při načítání profilu" });
  }
});
// 🆕 Smazání profilové fotky influencera
router.delete("/profile/photo", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const profile = await InfluencerProfile.findOne({ userId });
    if (!profile || !profile.photoUrl) {
      return res.status(404).json({ message: "Fotka neexistuje." });
    }

    const filePath = path.join(__dirname, "..", profile.photoUrl);
    
    // 🗑️ Zkusit fyzicky smazat soubor
    fs.unlink(filePath, (err) => {
      if (err) console.warn("⚠️ Nelze smazat soubor (možná už neexistuje):", err);
    });

    // 🧹 Vymazat photoUrl z profilu
    profile.photoUrl = undefined;
    await profile.save();

    res.json({ message: "✅ Fotka byla smazána." });
  } catch (err) {
    console.error("❌ Chyba při mazání fotky:", err);
    res.status(500).json({ message: "Chyba serveru při mazání fotky." });
  }
});

// Získat anonymizovaný seznam influencerů
router.get("/public-list", authenticateToken, async (req, res) => {
  try {
    const { ageGroup, location, gender, search, contactedOnly } = req.query;
    const query = {};

    if (ageGroup) {
      const ageRanges = {
        "15-18": { $gte: 15, $lte: 18 },
        "18-25": { $gte: 18, $lte: 25 },
        "25-35": { $gte: 25, $lte: 35 },
        "35-40": { $gte: 35, $lte: 40 },
        "40+": { $gte: 40 },
      };
      if (ageRanges[ageGroup]) {
        query.age = ageRanges[ageGroup];
      }
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (gender) {
      query.gender = gender;
    }

    if (search) {
      query.$or = [
        { bio: { $regex: search, $options: "i" } },
        { interests: { $regex: search, $options: "i" } },
      ];
    }

    let influencers = await InfluencerProfile.find(query).select(
      "_id name age location gender bio interests photoUrl"
    );

    if (contactedOnly === "true" && req.user.role === "business") {
      const business = await User.findById(req.user.userId);
      const contactedIds = business.contactedInfluencers.map(id => id.toString());
      influencers = influencers.filter(inf => contactedIds.includes(inf._id.toString()));
    }

    res.json({ influencers });
  } catch (err) {
    console.error("Chyba při získávání influencerů:", err);
    res.status(500).json({ message: "Chyba serveru" });
  }
});

// Kontaktování influencera
router.post("/contact/:id", authenticateToken, checkSubscriptionStatus, async (req, res) => {
  try {
    if (req.user.role !== "business") {
      return res.status(403).json({ message: "Pouze podniky mohou kontaktovat influencery." });
    }

    const business = await User.findById(req.user.userId);
    if (!business) {
      return res.status(401).json({ message: "Podnik nenalezen." });
    }

    resetContactsIfNeeded(business);

    const influencerId = req.params.id;
    const alreadyContacted = business.contactedInfluencers?.some(
      (id) => id.toString() === influencerId
    );

    if (alreadyContacted) {
      const profile = await InfluencerProfile.findById(influencerId);
      return res.json({ profile });
    }

    const profile = await InfluencerProfile.findById(influencerId);
    if (!profile) {
      return res.status(404).json({ message: "Influencer nenalezen." });
    }

    const limits = {
      free: 2,
      basic: 3,
      pro: 8,
    };

    const plan = business.subscriptionPlan || "free";
    const maxContacts = typeof business.allowedContacts === "number"
      ? business.allowedContacts
      : limits[plan] || 0;

    if (business.contactsUsedThisMonth >= maxContacts) {
      return res.status(403).json({ message: "Byl vyčerpán měsíční limit kontaktů." });
    }

    business.contactedInfluencers = business.contactedInfluencers || [];
    business.contactedInfluencers.push(influencerId);
    business.contactsUsedThisMonth += 1;
    if (business.subscriptionPlan === "free") {
      business.freePlanUsed = true;
    }

    await business.save();
    res.json({ profile });
  } catch (err) {
    console.error("Chyba při kontaktování influencera:", err);
    res.status(500).json({ message: "Chyba serveru." });
  }
});

// Zbývající kontakty
router.get("/remaining-contacts", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "business") {
      return res.status(403).json({ message: "Pouze pro podniky." });
    }

    const business = await User.findById(req.user.userId);
    if (!business) return res.status(404).json({ message: "Podnik nenalezen." });

    resetContactsIfNeeded(business);
    await business.save(); // Uloží změny po případném resetu
    
    const limits = {
      free: 2,
      basic: 3,
      pro: 8,
    };

    const plan = business.subscriptionPlan || "free";
    const maxContacts = typeof business.allowedContacts === "number"
      ? business.allowedContacts
      : limits[plan] || 0;

    const remaining = Math.max(0, maxContacts - (business.contactsUsedThisMonth || 0));

    res.json({ remainingContacts: remaining });
  } catch (err) {
    console.error("Chyba při získávání kontaktů:", err);
    res.status(500).json({ message: "Chyba serveru." });
  }
});

// Vrátit kontaktované influencery
router.get("/contacted", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "business") {
      return res.status(403).json({ message: "Pouze pro podniky." });
    }

    const business = await User.findById(req.user.userId).populate("contactedInfluencers", "_id");
    const contacted = business.contactedInfluencers.map((inf) => inf._id);

    res.json({ contacted });
  } catch (err) {
    console.error("Chyba při získávání kontaktovaných influencerů:", err);
    res.status(500).json({ message: "Chyba serveru." });
  }
});

module.exports = router;

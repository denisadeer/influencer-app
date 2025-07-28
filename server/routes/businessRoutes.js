// server/routes/businessRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const BusinessProfile = require("../models/BusinessProfile");

// Nastavení úložiště pro profilové fotky
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/business";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const upload = multer({ storage });


// ✅ ZÍSKAT PROFIL
router.get("/profile", (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token chybí' });

  require("jsonwebtoken").verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Neplatný token' });
    req.user = user;
    next();
  });
}, async (req, res) => {

  try {
    const BusinessProfile = require("../models/BusinessProfile");
const User = require("../models/User"); // 👈 přidej nahoře pokud tam není

const profile = await BusinessProfile.findOne({ userId: req.user.userId });
const user = await User.findById(req.user.userId);

if (!user) return res.status(404).json({ message: "Uživatel nenalezen" });

// Vracíme obě části: business profil + tarif
res.json({
  user: {
    email: user.email,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionCancelAt: user.subscriptionCancelAt,
subscriptionStartDate: user.subscriptionStartDate,

    // můžeš přidat i další pole pokud chceš
  },
  profile,
});



  } catch (err) {
    console.error("❌ Chyba při načítání profilu:", err);
    res.status(500).json({ message: "Chyba serveru" });
  }
});

// ✅ ULOŽIT PROFIL
router.post("/profile", (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token chybí' });

  require("jsonwebtoken").verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Neplatný token' });
    req.user = user;
    next();
  });
}, upload.single("photo"), async (req, res) => {

  try {console.log("🧾 Získaná data z req.body:", req.body);
       console.log("🖼️ Nahraná fotka:", req.file);


    const { name, website, igProfile, fbProfile, ttProfile, bio, location, businessField } = req.body;

    let profile = await BusinessProfile.findOne({ userId: req.user.userId });

    if (!profile) {
      profile = new BusinessProfile();
      profile.userId = req.user.userId; // ✅ DŮLEŽITÉ!
    }

    profile.name = name;
    profile.website = website;
    profile.igProfile = igProfile;
    profile.fbProfile = fbProfile;
    profile.ttProfile = ttProfile;
    profile.bio = bio;
    profile.location = location;
    profile.businessField = businessField;

    if (req.file) {
      profile.photoUrl = "/" + path.posix.join("uploads", "business", req.file.filename);
    }

    await profile.save();
    res.json({ message: "Profil uložen", profile });
  } catch (err) {
    console.error("❌ Chyba při ukládání profilu:", err);
    res.status(500).json({ message: "Chyba serveru při ukládání" });
  }
});
// ✅ Vrátit zbývající kontakty uživatele (včetně override)
router.get("/remaining-contacts", (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token chybí" });

  require("jsonwebtoken").verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Neplatný token" });
    req.user = user;
    next();
  });
}, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "Uživatel nenalezen" });
    }

    const used = user.contactsUsedThisMonth ?? 0;
    const allowed = user.allowedContacts ?? 0;
    const override = user.remainingContactOverride;

    const remaining = override !== null && override !== undefined
      ? override
      : allowed - used;

    res.json({ remainingContacts: remaining });
  } catch (err) {
    console.error("❌ Chyba při načítání zbývajících kontaktů:", err);
    res.status(500).json({ message: "Chyba serveru při načítání kontaktů" });
  }
});

// ✅ Veřejný profil podniku podle ID
router.get("/public/business/:id", async (req, res) => {
  try {
    const BusinessProfile = require("../models/BusinessProfile");
    const profile = await BusinessProfile.findOne({ userId: req.params.id });

    if (!profile) return res.status(404).json({ message: "Profil nenalezen" });

    // Vracíme jen veřejné informace
    res.json({
      profile: {
        name: profile.name,
        website: profile.website,
        igProfile: profile.igProfile,
        fbProfile: profile.fbProfile,
        ttProfile: profile.ttProfile,
        bio: profile.bio,
        location: profile.location,
        businessField: profile.businessField,
        photoUrl: profile.photoUrl,
      },
    });
  } catch (err) {
    console.error("❌ Chyba při načítání veřejného profilu:", err);
    res.status(500).json({ message: "Chyba serveru" });
  }
});



module.exports = router;

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
    const profile = await BusinessProfile.findOne({ userId: req.user.userId });
    res.json({ profile });
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


module.exports = router;

const express = require('express'); 
const router = express.Router();
const path = require("path");
const fs = require("fs");

const User = require('../models/User');
const InfluencerProfile = require('../models/InfluencerProfile');
const BusinessProfile = require('../models/BusinessProfile');

const authenticateToken = require('../middleware/authenticateToken');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// ✅ Získat seznam všech uživatelů (včetně lokalit)
router.get('/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password -emailVerificationToken');

    const usersWithLocation = await Promise.all(
      users.map(async (user) => {
        let location = null;

        if (user.role === 'influencer') {
          const profile = await InfluencerProfile.findOne({ userId: user._id });
          location = profile?.location ?? null;
        }

        if (user.role === 'business') {
          const profile = await BusinessProfile.findOne({ userId: user._id });
          location = profile?.location ?? null;
        }

        return {
          ...user.toObject(),
          location,
        };
      })
    );

    res.json(usersWithLocation);
  } catch (error) {
    console.error('Chyba při načítání uživatelů:', error);
    res.status(500).json({ message: 'Chyba při načítání uživatelů.' });
  }
});

// ✅ Smazat uživatele podle ID (jen admin)
router.delete('/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Uživatel nenalezen.' });
    }

    res.json({ message: 'Uživatel úspěšně smazán.' });
  } catch (error) {
    console.error('Chyba při mazání uživatele:', error);
    res.status(500).json({ message: 'Chyba serveru při mazání uživatele.' });
  }
});

// ✅ Načíst detail profilu pro admina (user + profil)
router.get('/user-profile/:userId', authenticateToken, authorizeAdmin, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId, '-password -emailVerificationToken');
    if (!user) return res.status(404).json({ message: 'Uživatel nenalezen' });

    const ProfileModel = user.role === 'influencer' ? InfluencerProfile : BusinessProfile;
    const profile = await ProfileModel.findOne({ userId: user._id });

    res.json({ user, profile });
  } catch (err) {
    console.error('Chyba při načítání profilu:', err);
    res.status(500).json({ message: 'Chyba serveru při načítání profilu.' });
  }
});

// ✅ Uložit nebo upravit profil a zároveň user hodnoty (např. plán)
router.post('/user-profile/:userId', authenticateToken, authorizeAdmin, async (req, res) => {
  const { userId } = req.params;
  const { profileUpdates = {}, userUpdates = {} } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Uživatel nenalezen' });

    // ✏️ Uložit změny do User
    if (Object.keys(userUpdates).length > 0) {
      Object.entries(userUpdates).forEach(([key, value]) => {
        user[key] = value;
      });

      // Pokud se upravuje subscriptionPlan, upravit kontakty
      if (userUpdates.subscriptionPlan === "basic") {
        user.allowedContacts = 3;
        user.subscriptionStartDate = new Date();
      }
      if (userUpdates.subscriptionPlan === "pro") {
        user.allowedContacts = 8;
        user.subscriptionStartDate = new Date();
      }

      await user.save();
    }

    // ✏️ Uložit změny do profilu
    const ProfileModel = user.role === 'influencer' ? InfluencerProfile : BusinessProfile;
    let profile = await ProfileModel.findOne({ userId: user._id });

    if (!profile) {
      profile = new ProfileModel({
        ...profileUpdates,
        userId: user._id,
      });
    } else {
      Object.entries(profileUpdates).forEach(([key, value]) => {
        if (key !== 'userId') {
          profile[key] = value;
        }
      });
    }

    await profile.save();

    res.json({ message: '✅ Uloženo', user, profile });
  } catch (err) {
    console.error('❌ Chyba při ukládání profilu:', err);
    res.status(500).json({ message: 'Chyba serveru při ukládání profilu.' });
  }
});

// ✅ Smazat fotku profilu (influencer)
router.delete("/user-profile/:userId/photo", authenticateToken, authorizeAdmin, async (req, res) => {
  const { userId } = req.params;

  try {
    const profile = await InfluencerProfile.findOne({ userId });
    if (!profile || !profile.photoUrl) {
      return res.status(404).json({ message: "Fotka nenalezena." });
    }

    const filePath = path.join(__dirname, "..", profile.photoUrl);
    console.log("🗑️ Mazání souboru:", filePath);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.warn("⚠️ Nelze smazat soubor:", err.message);
      } else {
        console.log("✅ Soubor smazán.");
      }
    });

    profile.photoUrl = undefined;
    await profile.save();

    res.json({ message: "✅ Fotka byla smazána." });
  } catch (error) {
    console.error("❌ Chyba při mazání fotky:", error);
    res.status(500).json({ message: "Chyba serveru při mazání fotky." });
  }
});

// ✅ Ruční úprava počtu kontaktů a aktivace "manual" předplatného
router.put('/user/:id/contacts', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { newContactLimit } = req.body;

  if (typeof newContactLimit !== 'number' || newContactLimit < 0) {
    return res.status(400).json({ message: 'Neplatný počet kontaktů.' });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Uživatel nenalezen.' });

    user.allowedContacts = newContactLimit;
    user.subscriptionPlan = 'manual';
    user.subscriptionStartDate = new Date();
    user.subscriptionCancelAt = undefined;

    await user.save();

    res.json({
      message: '✅ Počet kontaktů byl aktualizován a aktivováno manuální předplatné.',
      allowedContacts: user.allowedContacts,
    });
  } catch (error) {
    console.error('❌ Chyba při aktualizaci kontaktů:', error);
    res.status(500).json({ message: 'Chyba serveru při aktualizaci kontaktů.' });
  }
});

module.exports = router;

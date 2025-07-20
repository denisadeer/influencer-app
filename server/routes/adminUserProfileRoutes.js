const express = require('express');  
const router = express.Router();

const User = require('../models/User');
const InfluencerProfile = require('../models/InfluencerProfile');
const BusinessProfile = require('../models/BusinessProfile');

const authenticateToken = require('../middleware/authenticateToken');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// 🔍 Získat profil uživatele (User + profil)
router.get('/user-profile/:userId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select('-password -emailVerificationToken');

    if (!user) {
      return res.status(404).json({ message: 'Uživatel nenalezen.' });
    }

    const ProfileModel = user.role === 'influencer' ? InfluencerProfile : BusinessProfile;
    let profile = await ProfileModel.findOne({ userId: user._id });

    if (!profile && user.role === 'business') {
      profile = new BusinessProfile({ userId: user._id });
      await profile.save();
    }

    res.json({ user, profile });
  } catch (err) {
    console.error('❌ Chyba při načítání profilu:', err);
    res.status(500).json({ message: 'Chyba serveru při načítání profilu.' });
  }
});

// 💾 Uložit úpravy profilu + subscriptionPlan
router.post('/user-profile/:userId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { userUpdates = {}, profileUpdates = {} } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Uživatel nenalezen.' });
    }

    // ✏️ Uložit změny do User
    if (Object.keys(userUpdates).length > 0) {
      Object.entries(userUpdates).forEach(([key, value]) => {
        user[key] = value;
      });

      // ✅ Automaticky aktualizuj allowedContacts a startDate podle subscription plánu
      if (user.subscriptionPlan === "basic") {
        user.allowedContacts = 3;
        user.subscriptionStartDate = new Date();
      } else if (user.subscriptionPlan === "pro") {
        user.allowedContacts = 8;
        user.subscriptionStartDate = new Date();
      }

      await user.save();
    }

    // ✏️ Uložit profil
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

module.exports = router;

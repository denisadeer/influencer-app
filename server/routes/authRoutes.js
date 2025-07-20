const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

// ✅ REGISTRACE
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  const registrationIp = req.ip;

  if (process.env.NODE_ENV === "development") {
    console.log("📨 Příchozí data z frontendu:", { username, email, password, role });
  }

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "Vyplňte všechna pole" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Uživatel s tímto jménem už existuje." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailToken = crypto.randomBytes(32).toString("hex");

    const isBusiness = role === "business";

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      registrationIp,
      emailVerificationToken: emailToken,
      emailVerified: process.env.SKIP_EMAIL === "true",
      ...(isBusiness && {
        subscriptionPlan: "free",
        allowedContacts: 2,
        contactsUsedThisMonth: 0,
        freePlanUsed: true,
        subscriptionStartDate: new Date(),
      }),
    });

    await newUser.save();

    if (process.env.SKIP_EMAIL !== "true") {
      await sendVerificationEmail(email, emailToken);
    }

    res.status(201).json({
      message:
        process.env.SKIP_EMAIL === "true"
          ? "Registrace úspěšná (testovací režim)"
          : "Registrace úspěšná. Zkontrolujte e-mail.",
      data: { username, email, role },
    });
  } catch (err) {
    console.error("❌ Chyba při registraci:", err);
    res.status(500).json({ message: "Chyba serveru", error: err.message });
  }
});

// ✅ PŘIHLÁŠENÍ
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Uživatel nenalezen" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: "Nejdřív ověřte svůj e-mail." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Neplatné heslo" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Přihlášení OK",
      token,
      data: { role: user.role, userId: user._id },
    });
  } catch (err) {
    console.error("❌ Chyba při přihlášení:", err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// ✅ Ověření e-mailu (opraveno)
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
console.log("📩 API /verify-email bylo zavoláno");
console.log("Token:", req.query.token);

  if (!token) {
    return res.status(400).json({ message: "Token chybí." });
  }

  try {
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(404).json({ message: "Uživatel nenalezen." });
    }

    if (user.emailVerified) {
      return res.json({ message: "E-mail již byl ověřen." });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return res.json({ message: "E-mail ověřen." });
  } catch (err) {
    console.error("❌ Chyba při ověření e-mailu:", err);
    return res.status(400).json({ message: "Neplatný nebo expirovaný token." });
  }
});

// ✅ Zapomenuté heslo – odeslání e-mailu
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Chybí e-mail." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Uživatel s tímto e-mailem neexistuje." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    if (process.env.NODE_ENV === "development") {
      console.log("📨 RESET LINK:", resetLink);
    }

    await axios.post(
      "https://api.resend.com/emails",
      {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Obnovení hesla",
        html: `
          <h3>Obnovení hesla</h3>
          <p>Klikni na následující odkaz pro nastavení nového hesla:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>Odkaz platí 1 hodinu.</p>
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ message: "📧 E-mail pro obnovení hesla byl odeslán." });
  } catch (err) {
    console.error("❌ Chyba při odesílání e-mailu:", err);
    res.status(500).json({ message: "Chyba serveru při odesílání e-mailu." });
  }
});

// ✅ Reset hesla
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Chybí token nebo nové heslo." });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token je neplatný nebo expiroval." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({ message: "✅ Heslo bylo úspěšně změněno." });
  } catch (err) {
    console.error("❌ Chyba při resetu hesla:", err);
    res.status(500).json({ message: "Chyba serveru při resetu hesla." });
  }
});

// ✅ Odeslání ověřovacího e-mailu
async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  try {
    await axios.post(
      "https://api.resend.com/emails",
      {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Ověření e-mailové adresy",
        html: `
          <h3>Potvrďte svůj e-mail</h3>
          <p>Klikněte na následující odkaz pro ověření vaší e-mailové adresy:</p>
          <a href="${verifyUrl}">${verifyUrl}</a>
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("❌ Chyba při odesílání ověřovacího e-mailu:", err.response?.data || err.message);
    throw new Error("Nepodařilo se odeslat ověřovací e-mail.");
  }
}

module.exports = router;

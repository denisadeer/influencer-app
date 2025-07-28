const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/Message");
const authenticateToken = require("../middleware/authenticateToken");

// ✅ GET /conversations — načtení posledních zpráv a počtu nepřečtených
router.get("/conversations", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  console.log("🔐 Uživatelský token (req.user):", req.user);

  try {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId", "username role")
      .populate("receiverId", "username role")
      .sort({ timestamp: -1 });

    const conversationsMap = new Map();

    messages.forEach((msg) => {
      // ✅ Přeskakujeme zprávy s chybějícím senderId nebo receiverId
      if (!msg.senderId || !msg.receiverId) {
        console.warn("⚠️ Zpráva s neúplnými daty:", msg);
        return;
      }

      const otherUser = String(msg.senderId._id) === userId
        ? msg.receiverId
        : msg.senderId;

      const key = otherUser._id.toString();

      // ✅ Vytvoření záznamu v mapě, pokud ještě neexistuje
      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      // ✅ Výpočet počtu nepřečtených zpráv
      if (
        msg.read === false &&
        msg.receiverId &&
        typeof msg.receiverId === "object" &&
        msg.receiverId._id.toString() === userId
      ) {
        const otherUserId = msg.senderId._id.toString();
        if (conversationsMap.has(otherUserId)) {
          const conv = conversationsMap.get(otherUserId);
          conv.unreadCount = (conv.unreadCount || 0) + 1;
          console.log("🧮 Backend count++ pro:", otherUserId, "| zpráva:", msg.message);
        }
      }
    });

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (err) {
    console.error("❌ Chyba při načítání konverzací:", err);
    res.status(500).json({ message: "Chyba serveru při načítání konverzací." });
  }
});

// 📨 Odeslání nové zprávy
router.post("/", authenticateToken, async (req, res) => {
  const senderId = req.user.userId;
  const { receiverId: rawReceiverId, message, content } = req.body;
  const finalMessage = message || content;

  console.log("🛬 Request body:", req.body);

  if (!rawReceiverId || !finalMessage) {
    console.log("❌ Chybějící data při ukládání zprávy:", {
      rawReceiverId,
      finalMessage,
    });
    return res.status(400).json({ message: "Chybí příjemce nebo zpráva." });
  }

  let receiverId;
  try {
    receiverId = new mongoose.Types.ObjectId(rawReceiverId);
  } catch (err) {
    console.error("❌ Neplatné receiverId:", rawReceiverId);
    return res.status(400).json({ message: "Neplatné ID příjemce." });
  }

  try {
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: finalMessage,
      timestamp: new Date(),
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "username role")
      .populate("receiverId", "username role");

    console.log("✅ Zpráva uložena:", populatedMessage);
    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("❌ Chyba při ukládání zprávy:", err);
    res.status(500).json({ message: "Chyba serveru" });
  }
});

// ✅ GET /:userId — načtení všech zpráv pro konkrétního uživatele
router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId", "username role")
      .populate("receiverId", "username role")
      .sort({ timestamp: 1 });

    console.log("📨 Načteno zpráv:", messages.length);
    res.json(messages);
  } catch (err) {
    console.error("❌ Chyba při získávání zpráv:", err);
    res.status(500).json({ message: "Chyba při načítání zpráv" });
  }
});

// ✅ PATCH /mark-as-read — označení zpráv jako přečtené
router.patch("/mark-as-read", authenticateToken, async (req, res) => {
  const receiverId = req.user.userId;
  const { senderId } = req.body;

  if (!senderId) {
    return res.status(400).json({ message: "Chybí senderId" });
  }

  try {
    const result = await Message.updateMany(
      { senderId, receiverId, read: false },
      { $set: { read: true } }
    );

    console.log(`✅ Označeno jako přečtené: ${result.modifiedCount} zpráv`);
    res.json({
      message: "Zprávy označeny jako přečtené",
      count: result.modifiedCount,
    });
  } catch (err) {
    console.error("❌ Chyba při označování jako přečtené:", err);
    res.status(500).json({ message: "Chyba serveru" });
  }
});

module.exports = router;

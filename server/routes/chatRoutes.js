const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/Message");
const authenticateToken = require("../middleware/authenticateToken");

// GET: Získání všech zpráv daného uživatele
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

// POST: Odeslání zprávy
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

  console.log("📨 Příchozí zpráva:", {
    senderId,
    receiverId,
    finalMessage,
  });

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

module.exports = router;

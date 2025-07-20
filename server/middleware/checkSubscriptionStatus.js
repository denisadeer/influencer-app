const User = require("../models/User");

/**
 * Middleware: ověří, zda má uživatel aktivní (placené / manuální) předplatné.
 * Povolí plány: basic, pro, manual.
 */
module.exports = async function checkSubscriptionStatus(req, res, next) {
  try {
    const userId = req.user.userId || req.user.id;
    const user   = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Uživatel nenalezen." });
    }

    // 🟢 Plány, které se počítají jako aktivní
    const activePlans = ["basic", "pro", "manual"];

    // ❌ Pokud plán není mezi aktivními (= free nebo undefined)
    if (!activePlans.includes(user.subscriptionPlan)) {
      return res.status(403).json({ message: "Nemáš aktivní předplatné." });
    }

    // ❌ Pro placené plány basic / pro zkontroluj případné zrušení
    if (
      user.subscriptionPlan !== "manual" &&               // manuál vždy platí
      user.subscriptionCancelAt &&
      new Date(user.subscriptionCancelAt) <= new Date()   // už po datu zrušení
    ) {
      return res.status(403).json({ message: "Tvé předplatné již vypršelo." });
    }

    // ✅ Vše v pořádku
    next();
  } catch (err) {
    console.error("❌ Chyba v kontrolním middleware:", err);
    res.status(500).json({ message: "Chyba serveru při kontrole předplatného." });
  }
};

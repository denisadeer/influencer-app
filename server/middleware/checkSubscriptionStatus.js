const User = require("../models/User");

/**
 * Middleware: ověří, zda má uživatel aktivní předplatné (placené nebo free s kontakty).
 */
module.exports = async function checkSubscriptionStatus(req, res, next) {
  try {
    const userId = req.user.userId || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Uživatel nenalezen." });
    }

    const now = new Date();

    // ❌ Pokud má placený plán a ten již vypršel
    if (
      user.subscriptionPlan !== "manual" &&
      user.subscriptionPlan !== "free" &&
      user.subscriptionCancelAt &&
      new Date(user.subscriptionCancelAt) <= now
    ) {
      return res.status(403).json({ message: "Tvé předplatné již vypršelo." });
    }

    // ❌ Pokud nemá žádné kontakty – platí i pro free plán
    if (!user.allowedContacts || user.allowedContacts <= 0) {
      return res.status(403).json({ message: "Nemáš aktivní volné kontakty." });
    }

    // ✅ Vše OK – povolíme
    next();
  } catch (err) {
    console.error("❌ Chyba v kontrolním middleware:", err);
    res.status(500).json({ message: "Chyba serveru při kontrole předplatného." });
  }
};

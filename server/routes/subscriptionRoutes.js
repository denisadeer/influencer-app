const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authenticateToken = require("../middleware/authenticateToken");
const User = require("../models/User");

// 🧾 Vytvoření Stripe Checkout session
router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  console.log("🔐 Ověřený uživatel:", req.user);

  const { priceId } = req.body;

  try {
    const user = await User.findById(req.user.userId || req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Uživatel nenalezen." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      billing_address_collection: "required",
      custom_fields: [
    {
      key: "company_name",
      label: {
        type: "custom",
        custom: "Název firmy nebo jméno živnostníka"
      },
      type: "text",
      optional: false
    }
  ],
      metadata: {
        userId: user._id.toString(),
        priceId,
      },
      success_url: `${process.env.FRONTEND_URL}/platba-uspesna`,
      cancel_url: `${process.env.FRONTEND_URL}/platba-zrusena`,
      expand: ["subscription"], // 👈 DŮLEŽITÉ!
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Chyba v checkout session:", error);
    res.status(500).json({ message: "Chyba při vytváření platby." });
  }
});

// ⚙️ Odeslání uživatele do Stripe Customer Portálu
router.post("/manage", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId || req.user.id);

    if (!user) {
      console.error("❌ Uživatel nenalezen.");
      return res.status(404).json({ message: "Uživatel nenalezen." });
    }

    if (!user.stripeCustomerId) {
      console.error("❌ Uživatel nemá stripeCustomerId uložený.");
      return res.status(404).json({ message: "Stripe zákazník nenalezen." });
    }

    console.log("📦 Stripe customer ID:", user.stripeCustomerId);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    console.log("✅ Portal session URL:", portalSession.url);

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error("❌ Chyba při vytváření Stripe portálu:", error);
    res.status(500).json({ message: "Chyba serveru při přístupu k předplatnému." });
  }
});

// 🛑 Zrušit předplatné (na konci období) – (NEPOUŽÍVÁ SE POKUD MÁŠ STRIPE PORTÁL)
router.post("/cancel", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({ message: "Předplatné nenalezeno." });
    }

    const canceledSub = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    const cancelAtTimestamp = canceledSub.current_period_end;

    if (!cancelAtTimestamp || isNaN(cancelAtTimestamp)) {
      console.error("❌ Stripe neposlal validní current_period_end:", cancelAtTimestamp);
      return res.status(500).json({ message: "Neplatné datum ukončení předplatného." });
    }

    const cancelAt = new Date(cancelAtTimestamp * 1000);
    user.subscriptionCancelAt = cancelAt;

    await user.save();

    res.json({ message: "✅ Předplatné bude zrušeno", cancelAt });
  } catch (err) {
    console.error("❌ Chyba při rušení předplatného:", err);
    res.status(500).json({ message: "Chyba při rušení předplatného." });
  }
});

module.exports = router;

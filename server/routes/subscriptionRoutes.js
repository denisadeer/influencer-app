const express = require("express"); 
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const auth = require("../middleware/authenticateToken");
const User = require("../models/User");

// 🧾 Vytvoření Stripe Checkout session
router.post("/create-checkout-session", auth, async (req, res) => {
  console.log("🔐 Ověřený uživatel:", req.user);

  const { priceId } = req.body;

  try {
    const user = await User.findById(req.user.userId || req.user.id);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
        priceId,
      },
      success_url: `${process.env.FRONTEND_URL}/platba-uspesna`,
      cancel_url: `${process.env.FRONTEND_URL}/platba-zrusena`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Chyba v checkout session:", error);
    res.status(500).json({ message: "Chyba při vytváření platby." });
  }
});

// 🛑 Odeslání uživatele do Stripe Customer Portálu
router.post("/manage", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId || req.user.id);

    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ message: "Stripe zákazník nenalezen." });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error("❌ Chyba při vytváření Stripe portálu:", error);
    res.status(500).json({ message: "Chyba serveru při přístupu k předplatnému." });
  }
});

module.exports = router;

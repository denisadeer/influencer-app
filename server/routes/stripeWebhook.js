const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");
const bodyParser = require("body-parser");

// Middleware pro příjem raw dat
router.post(
  "/",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Chyba ověření podpisu Stripe:", err.message);
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    // 🟢 Úspěšná platba
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const priceId = session.metadata?.priceId;

      if (!userId || !priceId) {
        console.error("❌ Chybí metadata userId nebo priceId.");
        return res.status(400).send("Chybí metadata.");
      }

      let plan = "";
      let remainingContacts = 0;

      if (priceId === process.env.STRIPE_PRICE_BASIC) {
        plan = "basic";
        remainingContacts = 3;
      } else if (priceId === process.env.STRIPE_PRICE_PRO) {
        plan = "pro";
        remainingContacts = 8;
      } else {
        console.error("❌ Neznámý priceId:", priceId);
        return res.status(400).send("Neplatný priceId");
      }

      try {
        const user = await User.findById(userId);
        if (!user) {
          console.error("❌ Uživatel nenalezen:", userId);
          return res.status(404).send("Uživatel nenalezen");
        }

        user.subscriptionPlan = plan;
        user.allowedContacts = remainingContacts;
        user.contactsUsedThisMonth = 0;
        user.subscriptionStartDate = new Date();
        user.stripeCustomerId = session.customer;

        if (!user.freePlanUsed) {
          user.freePlanUsed = true;
        }

        await user.save();
        console.log(`✅ Uživatel ${user.email} upgradoval na plán "${plan}"`);
      } catch (err) {
        console.error("❌ Chyba při ukládání uživatele:", err);
        return res.status(500).send("Server error");
      }
    }

    // 🛑 Předplatné zrušeno (čeká na konec období)
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;

      if (subscription.cancel_at_period_end && subscription.customer) {
        try {
          const user = await User.findOne({ stripeCustomerId: subscription.customer });
          if (!user) {
            console.warn("⚠️ Uživatel s tímto Stripe ID nebyl nalezen.");
            return res.status(404).send("Uživatel nenalezen");
          }

          user.subscriptionCancelAt = new Date(subscription.current_period_end * 1000); // timestamp → JS date

          await user.save();
          console.log(`🔕 Uživatel ${user.email} zrušil předplatné, platí do ${user.subscriptionCancelAt.toISOString()}`);
        } catch (err) {
          console.error("❌ Chyba při aktualizaci zrušeného předplatného:", err);
          return res.status(500).send("Server error");
        }
      }
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;

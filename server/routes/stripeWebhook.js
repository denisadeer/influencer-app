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

    // ✅ Úspěšná platba
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("✅ Webhook přijat – session.completed:");
      console.log("🔍 Webhook payload:", JSON.stringify(session, null, 2));

      const userId = session.metadata?.userId;
      const priceId = session.metadata?.priceId;
      const subscriptionId = session.subscription;

      console.log("📦 Subscription ID z checkout.session.completed:", subscriptionId);

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
        user.remainingContactOverride = null; // plán má přednost před ručním override


        if (subscriptionId) {
          console.log("📦 Stripe subscription bude uloženo:", subscriptionId);
          user.stripeSubscriptionId = subscriptionId;
        } else {
          console.warn("⚠️ session.subscription je prázdné!");
        }

        if (!user.freePlanUsed) {
          user.freePlanUsed = true;
        }

        console.log("💾 Uživatel před uložením:", {
          email: user.email,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          plan,
        });

        await user.save();
        console.log(`✅ Uživatel ${user.email} upgradoval na plán "${plan}"`);
      } catch (err) {
        console.error("❌ Chyba při ukládání uživatele:", err);
        return res.status(500).send("Server error");
      }
    }if (event.type === "invoice.paid") {
  const invoice = event.data.object;
  const customerId = invoice.customer;

  try {
    const user = await User.findOne({ stripeCustomerId: customerId });
    if (!user) {
      console.warn("⚠️ Uživatel pro invoice.paid nenalezen:", customerId);
      return res.status(404).send("Uživatel nenalezen");
    }

    const priceId = invoice.lines?.data?.[0]?.price?.id;

    if (!priceId) {
      console.warn("⚠️ invoice.paid nemá priceId:", JSON.stringify(invoice, null, 2));
      return res.status(400).send("Neplatné priceId");
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
      console.warn("⚠️ Neznámý priceId z invoice.paid:", priceId);
      return res.status(400).send("Neplatný priceId");
    }

    user.subscriptionPlan = plan;
    user.allowedContacts = remainingContacts;
    user.contactsUsedThisMonth = 0;
    user.subscriptionStartDate = new Date();
    user.remainingContactOverride = null;

    await user.save();
    console.log(`✅ [invoice.paid] Uživatel ${user.email} obnoven plán ${plan}`);
  } catch (err) {
    console.error("❌ Chyba při zpracování invoice.paid:", err);
    return res.status(500).send("Server error");
  }
}


    // 🛑 Zrušení předplatného na konci období
    if (event.type === "customer.subscription.updated") {
      const subscriptionData = event.data.object;
      console.log("🔄 Stripe subscription.updated event:", subscriptionData.id);
      console.log("📅 Bude zrušeno na konci období:", subscriptionData.cancel_at_period_end);
      console.log("🧪 Kontrola subscriptionData.id:", subscriptionData.id);

      if (subscriptionData.cancel_at_period_end && subscriptionData.id) {
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionData.id);
          console.log("📋 Full subscription detail z Stripe:", JSON.stringify(subscription, null, 2));

          const user = await User.findOne({ stripeCustomerId: subscription.customer });
          if (!user) {
            console.warn("⚠️ Uživatel s tímto Stripe ID nebyl nalezen.");
            return res.status(404).send("Uživatel nenalezen");
          }

          const cancelAtTimestamp = subscription.items?.data?.[0]?.current_period_end;
          if (!cancelAtTimestamp || isNaN(cancelAtTimestamp)) {
            console.error("❌ Stripe neposlal validní current_period_end (v items.data[0]):", cancelAtTimestamp);
            return res.status(500).send("Neplatné datum ukončení");
          }

          user.subscriptionCancelAt = new Date(cancelAtTimestamp * 1000);
          await user.save();

          console.log(`🔕 Uživatel ${user.email} zrušil předplatné, platí do ${user.subscriptionCancelAt.toISOString()}`);
        } catch (err) {
          console.error("❌ Chyba při načítání celé subscription nebo aktualizaci uživatele:", err);
          return res.status(500).send("Server error");
        }
      }
    }

    // ✅ Odpověď Stripe
    res.status(200).json({ received: true });
  }
);

module.exports = router;

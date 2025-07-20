// utils/resetContactsIfNeeded.js

module.exports = async function resetContactsIfNeeded(user) {
  if (!user.subscriptionPlan || !user.subscriptionStartDate) return;

  const now = new Date();
  const lastReset = new Date(user.subscriptionStartDate);
  const daysSinceReset = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));

  if (daysSinceReset >= 30) {
    user.contactsUsedThisMonth = 0;
    user.subscriptionStartDate = now;

    if (user.subscriptionPlan === "basic") {
      user.allowedContacts = 3;
    } else if (user.subscriptionPlan === "pro") {
      user.allowedContacts = 8;
    }

    await user.save(); // ✅ Uložit změny do databáze
    console.log(`🔁 Resetován kontaktový limit pro ${user.email}`);
  }
};

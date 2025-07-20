import axios from "axios";
import React from "react";

const handleSubscribe = async (priceId) => {
  try {
    const res = await axios.post(
      "http://localhost:5713/api/subscription/create-checkout-session",
      { priceId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    window.location.href = res.data.url;
  } catch (error) {
    alert("Chyba pri vytvareni platby: " + error.response?.data?.message || error.message);
  }
};

export default function SubscriptionPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Vyber si tarif</h2>
      <button onClick={() => handleSubscribe("price_1RkpZJ3NgjyNB5EMKiFPQ1xI")}>
        Koupit BASIC (3 kontakty)
      </button>
      <br />
      <button onClick={() => handleSubscribe("price_1Rkpav3NgjyNB5EMcPp7TkIb")}>
        Koupit PRO (8 kontaktů)
      </button>
    </div>
  );
}
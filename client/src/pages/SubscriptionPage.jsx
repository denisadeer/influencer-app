import axios from "axios";
import React, { useState, useEffect } from "react";

export default function SubscriptionPage() {
  const [message, setMessage] = useState("");
  const [cancelAt, setCancelAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  const handleSubscribe = async (priceId) => {
    try {
      const res = await axios.post(
        "http://localhost:5713/api/subscription/create-checkout-session",
        { priceId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.location.href = res.data.url;
    } catch (error) {
      alert(
        "Chyba při vytváření platby: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleManagePortal = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5713/api/subscription/manage",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.location.href = res.data.url;
    } catch (err) {
      alert("❌ Nepodařilo se otevřít Stripe portál.");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5713/api/business/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data && res.data.user) {
          setUser(res.data.user);
          setCancelAt(res.data.user.subscriptionCancelAt || null);
        }
      } catch (err) {
        console.error("❌ Nelze načíst info o uživateli:", err);
      }
    };

    fetchUser();
  }, [token]);

  const renderPlanName = () => {
    if (!user) return "Načítám...";
    const plan = user.subscriptionPlan || "free";
    return (
      <strong style={{ color: "#FFAC76", fontSize: "1.2rem" }}>
        {plan.toUpperCase()}
      </strong>
    );
  };

  const renderResetOrEndDate = () => {
    if (!user || user.subscriptionPlan === "free") return null;

    const { subscriptionStartDate, subscriptionCancelAt } = user;

    let label = "";
    let date = null;

    if (subscriptionCancelAt) {
      label = "Konec balíčku";
      date = new Date(subscriptionCancelAt);
    } else if (subscriptionStartDate) {
      label = "Reset balíčku";
      const resetDate = new Date(subscriptionStartDate);
      resetDate.setDate(resetDate.getDate() + 30);
      date = resetDate;
    }

    if (!date) return null;

    return (
      <p>
        🗓️ {label}: <strong>{date.toLocaleDateString("cs-CZ")}</strong>
      </p>
    );
  };

  return (
    <div className="container py-4">
      {/* Oranžová hlavička */}
      <section
        style={{ backgroundColor: "#FFAC76" }}
        className="text-center py-3 mb-4 rounded"
      >
        <img src="/images/logo.png" alt="Logo" style={{ height: "60px" }} />
        <h2 className="logo-font mt-2 mb-0">MicroMatch</h2>
      </section>

      {/* Obsah balíčku */}
      <div
        className="card shadow p-4"
        style={{ backgroundColor: "#FFF0E0", maxWidth: "600px", margin: "0 auto" }}
      >
        <p>
          Aktuální balíček: {renderPlanName()}
        </p>

        {renderResetOrEndDate()}

        <hr />

        <h5>➔ Koupit nebo změnit balíček</h5>
        <div className="d-grid gap-2 mb-3">
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => handleSubscribe("price_1RkpZJ3NgjyNB5EMKiFPQ1xI")}
          >
            BASIC (3 kontakty)
          </button>
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => handleSubscribe("price_1Rkpav3NgjyNB5EMcPp7TkIb")}
          >
            PRO (8 kontaktů)
          </button>
        </div>

        <hr />

        {user?.subscriptionPlan !== "free" && (
          <>
            <h5>⚙️ Správa předplatného</h5>
            <div className="d-grid gap-2 mb-3">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={handleManagePortal}
                disabled={loading}
              >
                {loading ? "Načítání..." : "Spravovat"}
              </button>
            </div>
          </>
        )}

        {message && (
          <p className="text-center mt-3" style={{ fontWeight: "bold" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

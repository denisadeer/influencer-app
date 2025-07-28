// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InfluencerDashboard from "../components/InfluencerDashboard";
import BusinessDashboard from "../components/BusinessDashboard";
import AdminDashboard from "../pages/AdminDashboard"; // nebo ../components pokud ho přesuneš

function Dashboard() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (!token) {
      console.warn("❌ Token chybí – přesměrování na login");
      navigate("/login");
    } else {
      setRole(storedRole);
      console.log("📛 Nastavena role:", storedRole);
    }
  }, [navigate]);

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ textAlign: "right", marginBottom: "1rem" }}>
        <button onClick={handleLogout} className="btn btn-orange px-4 py-2">
  🔓 Odhlásit se
</button>
      </div>

      {/* <h2>Dashboard</h2>
<p>Jste přihlášen jako: <strong>{role}</strong></p> */}

      {role === "influencer" && (
        <>
          {console.log("🎯 Zobrazuji InfluencerDashboard")}
          <InfluencerDashboard />
        </>
      )}

      {role === "business" && (
        <>
          {console.log("🏢 Zobrazuji BusinessDashboard")}
          <BusinessDashboard />
        </>
      )}

      {role === "admin" && (
        <>
          {console.log("🛡️ Zobrazuji AdminDashboard")}
          <AdminDashboard />
        </>
      )}

      {!["influencer", "business", "admin"].includes(role) && (
        <p>❗ Role není podporována.</p>
      )}
    </div>
  );
}

export default Dashboard;



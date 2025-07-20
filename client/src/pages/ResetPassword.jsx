import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    try {
      const res = await fetch("http://localhost:5713/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Heslo bylo úspěšně změněno.");
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setMessage(`❌ Chyba: ${data.message || "Nepodařilo se změnit heslo."}`);
      }
    } catch (err) {
      console.error("❌ Chyba při resetu hesla:", err);
      setMessage("❌ Chyba při komunikaci se serverem.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Obnovení hesla</h2>
      <p>Zadejte nové heslo pro svůj účet.</p>

      <input
        type="password"
        placeholder="Nové heslo"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "300px" }}
      />

      <br />

      <button onClick={handleReset} disabled={!newPassword}>
        🔒 Nastavit nové heslo
      </button>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}

export default ResetPassword;

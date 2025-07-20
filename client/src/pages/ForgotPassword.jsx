import React, { useState } from "react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5713/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("📧 E-mail pro obnovení hesla byl odeslán.");
      } else {
        setMessage(`❌ Chyba: ${data.message || "Nepodařilo se odeslat e-mail."}`);
      }
    } catch (err) {
      console.error("❌ Chyba při komunikaci se serverem:", err);
      setMessage("❌ Chyba při komunikaci se serverem.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Zapomenuté heslo</h2>
      <p>
        Zadejte e-mail, který jste použili při registraci. Pošleme vám odkaz pro obnovu hesla.
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          E-mail:
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "0.5rem", width: "300px", marginBottom: "1rem" }}
          />
        </label>
        <br />
        <button type="submit">Odeslat</button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}

export default ForgotPassword;


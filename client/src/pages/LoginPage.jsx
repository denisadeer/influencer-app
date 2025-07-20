import React, { useState } from "react";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5713/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.data.role);
        localStorage.setItem("userId", data.data.userId); // 🆕 přidáno

        setMessage("✅ Přihlášení proběhlo úspěšně!");
        window.location.href = "/dashboard";
      } else {
        setMessage(`❌ ${data.error || "Přihlášení se nezdařilo."}`);
      }
    } catch (error) {
      console.error("❌ Chyba přihlášení:", error);
      setMessage("❌ Chyba při komunikaci se serverem.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Přihlášení</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", maxWidth: "300px" }}>
        <label>
          Uživatelské jméno:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label>
          Heslo:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" style={{ marginTop: "1rem" }}>
          Přihlásit se
        </button>
      </form>
<p style={{ marginTop: "1rem" }}>
  <a href="/forgot-password" style={{ color: "blue", textDecoration: "underline" }}>
    Zapomněli jste heslo?
  </a>
</p>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}

export default LoginPage;


import React, { useState } from "react";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.data.role);
        localStorage.setItem("userId", data.data.userId);

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
    <div
      style={{ backgroundColor: "#ffffff", minHeight: "100vh", paddingTop: "60px" }}
    >
      <div
        className="container py-5"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <div
          className="rounded p-4 shadow"
          style={{
            width: "100%",
            maxWidth: "520px",
            backgroundColor: "#FFAC76",
          }}
        >
          {/* Logo + Nadpis */}
          <div className="text-center mb-4">
            <img
              src="/images/logo.png"
              alt="Logo"
              style={{ width: "100px", height: "100px" }}
            />
            <h3 className="logo-font mt-2 mb-0">MicroMatch</h3>
          </div>

          <p className="text-dark fw-bold mb-1">Přihlášení</p>
          <p className="text-dark mb-3">
            Zadejte své údaje pro přihlášení do aplikace.
          </p>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div>
              <label className="form-label">Uživatelské jméno</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Heslo</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-end">
              <a
                href="/forgot-password"
                style={{ color: "#000DD2", textDecoration: "underline" }}
              >
                Zapomněli jste heslo?
              </a>
            </div>

            <button type="submit" className="btn-blue mt-2">
              Přihlásit se
            </button>
          </form>

          {message && <p className="mt-3">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

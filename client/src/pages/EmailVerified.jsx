import React from "react";
import { useNavigate } from "react-router-dom";

function EmailVerified() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>✅ E-mail úspěšně ověřen!</h2>
      <p>Nyní se můžeš přihlásit ke svému účtu.</p>
      <button
        onClick={() => navigate("/login")}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
      >
        Přejít na přihlášení
      </button>
    </div>
  );
}

export default EmailVerified;

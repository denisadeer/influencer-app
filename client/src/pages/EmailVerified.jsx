import React from "react";
import { useNavigate } from "react-router-dom";

function EmailVerified() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", paddingTop: "60px" }}>
      <div
        className="container py-5"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <div
          className="rounded p-4 shadow text-center"
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
              style={{ width: "80px", height: "80px" }}
            />
            <h3 className="logo-font mt-2 mb-0">MicroMatch</h3>
          </div>

          <h4 className="text-dark">✅ E-mail úspěšně ověřen!</h4>
          <p className="text-dark mb-4">Nyní se můžeš přihlásit ke svému účtu.</p>

          <button
            className="btn btn-blue"
            onClick={() => navigate("/login")}
          >
            Přejít na přihlášení
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailVerified;

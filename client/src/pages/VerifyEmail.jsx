// src/pages/VerifyEmail.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/dashboardInfluencer.css";

function VerifyEmail() {
  const [status, setStatus] = useState("loading");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          console.log("✅ Ověření OK:", data.message);
          setStatus("success");
          setTimeout(() => navigate("/email-verified"), 2000);
        } else {
          console.error("❌ Chyba ověření:", data.message);
          setStatus("error");
        }
      } catch (err) {
        console.error("❌ Chyba fetch:", err);
        setStatus("error");
      }
    };

    verify();
  }, [searchParams, navigate]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <p className="text-center text-muted fs-5">🔄 Ověřuji e-mail...</p>
        );
      case "success":
        return (
          <p className="text-center text-success fs-5">
            ✅ E-mail ověřen, přesměrování...
          </p>
        );
      default:
        return (
          <p className="text-center text-danger fs-5">
            ❌ Neplatný nebo expirovaný ověřovací odkaz.
          </p>
        );
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          {/* Hlavička */}
          <header className="text-center py-4 mb-4">
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: 22,
                padding: "12px 22px",
                display: "inline-block",
                border: "1px solid rgb(197, 197, 197)",
                boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
              }}
            >
              <img
                src="/images/logo.png"
                alt="Logo"
                style={{ width: 70, height: 70 }}
              />
              <h2 className="mt-2 text-dark">MicroMatch</h2>
            </div>
          </header>

          {/* Obsah */}
          <div
            className="set-custom-side-bar p-4 text-center"
            style={{ borderRadius: 10 }}
          >
            <h4 className="mb-3">📧 Ověření e-mailu</h4>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;

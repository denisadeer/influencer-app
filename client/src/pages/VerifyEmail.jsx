// src/pages/VerifyEmail.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

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

  if (status === "loading") return <p>🔄 Ověřuji e-mail...</p>;
  if (status === "success") return <p>✅ E-mail ověřen, přesměrování...</p>;
  return <p>❌ Neplatný nebo expirovaný ověřovací odkaz.</p>;
}

export default VerifyEmail;

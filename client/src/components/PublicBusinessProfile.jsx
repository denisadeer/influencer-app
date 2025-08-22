import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/dashboardInfluencer.css";

const API_BASE = "http://localhost:5713";

function PublicBusinessProfile() {
  const { id } = useParams();               // ID podniku z URL
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  // Pomocná funkce: doplní https:// když chybí
  const normalizeUrl = (u) => {
    if (!u) return "";
    return /^https?:\/\//i.test(u) ? u : `https://${u}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/public/business/${id}`);
        setProfile(res.data);
      } catch (err) {
        console.error("❌ Chyba při načítání veřejného profilu podniku:", err);
        setError("Nepodařilo se načíst veřejný profil podniku.");
      }
    };
    fetchProfile();
  }, [id]);

  if (error) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <p className="mb-3">{error}</p>
          <button className="set-btn-white-custom" onClick={() => navigate(-1)}>↩️ Zpět</button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">Načítám veřejný profil podniku…</div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          {/* Hlavička jako na ostatních stránkách */}
          <header className="text-center py-3 mb-4">
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "22px",
                padding: "12px 22px",
                display: "inline-block",
                border: "1px solid rgb(197, 197, 197)",
                boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
              }}
            >
              <img src="/images/logo.png" alt="Logo" style={{ width: 70, height: 70 }} />
              <h2 className="mt-2 text-dark" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
                MicroMatch
              </h2>
            </div>
          </header>

          {/* Meruňková karta s obsahem */}
          <div className="set-custom-side-bar p-3" style={{ borderRadius: 10 }}>
            <div className="row">
              {/* Levý sloupec – foto a základní info */}
              <div className="col-md-4 text-center mb-3">
                <img
                  src={
                    profile.photoUrl
                      ? `${API_BASE}${profile.photoUrl}`
                      : "/images/avatar-placeholder.png"
                  }
                  alt="Profilová fotka"
                  className="img-fluid rounded-circle"
                  style={{ width: 180, height: 180, objectFit: "cover" }}
                />
                <h4 className="mt-3 mb-1">{profile.name || "—"}</h4>
                <div className="text-muted">{profile.location || "—"}</div>
                <div className="mt-2">
                  <span className="badge text-bg-light" style={{ border: "1px solid #fed9ca" }}>
                    {profile.businessField || "Obor neuveden"}
                  </span>
                </div>
                <div className="mt-3">
                  <button className="set-btn-white-custom" onClick={() => navigate(-1)}>
                    ← Zpět
                  </button>
                </div>
              </div>

              {/* Pravý sloupec – detailní informace */}
              <div className="col-md-8">
                <div className="row">
                  <div className="col-12 set--input-all">
                    <label>Web:</label>
                    <div className="form-control mb-3">
                      {profile.website ? (
                        <a href={normalizeUrl(profile.website)} target="_blank" rel="noreferrer">
                          {profile.website}
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>

                  <div className="col-md-6 set--input-all">
                    <label>Instagram:</label>
                    <div className="form-control mb-3">
                      {profile.igProfile ? (
                        <a href={normalizeUrl(profile.igProfile)} target="_blank" rel="noreferrer">
                          {profile.igProfile}
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>

                  <div className="col-md-6 set--input-all">
                    <label>Facebook:</label>
                    <div className="form-control mb-3">
                      {profile.fbProfile ? (
                        <a href={normalizeUrl(profile.fbProfile)} target="_blank" rel="noreferrer">
                          {profile.fbProfile}
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>

                  <div className="col-md-6 set--input-all">
                    <label>TikTok:</label>
                    <div className="form-control mb-3">
                      {profile.ttProfile ? (
                        <a href={normalizeUrl(profile.ttProfile)} target="_blank" rel="noreferrer">
                          {profile.ttProfile}
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>

                  <div className="col-12 set--input-all">
                    <label>Bio:</label>
                    <div className="form-control mb-3" style={{ minHeight: 90 }}>
                      {profile.bio || "—"}
                    </div>
                  </div>
                </div>

                {/* Akce */}
                <div className="mt-2">
                  <button className="set-btn-custom me-2" onClick={() => navigate(-1)}>
                    ↩️ Zpět
                  </button>
                  <button
                    className="set-btn-custom"
                    onClick={() => navigate(`/chat/${id}`)}
                    title="Otevřít chat s tímto podnikem"
                  >
                    💬 Napsat zprávu
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Spodní mezera */}
          <div className="my-3" />
        </div>
      </div>
    </div>
  );
}

export default PublicBusinessProfile;

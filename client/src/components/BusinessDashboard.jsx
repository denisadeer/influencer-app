import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/dashboardInfluencer.css";

function BusinessDashboard() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    website: "",
    igProfile: "",
    fbProfile: "",
    ttProfile: "",
    bio: "",
    location: "",
    businessField: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [remainingContacts, setRemainingContacts] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5713/api/business/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.profile) {
          setForm({
            name: data.profile.name || "",
            website: data.profile.website || "",
            igProfile: data.profile.igProfile || "",
            fbProfile: data.profile.fbProfile || "",
            ttProfile: data.profile.ttProfile || "",
            bio: data.profile.bio || "",
            location: data.profile.location || "",
            businessField: data.profile.businessField || "",
          });
          if (data.profile.photoUrl) {
            setPhotoPreview(`http://localhost:5713${data.profile.photoUrl}`);
          }
        }
      } catch (err) {
        console.error("❌ Chyba při načítání profilu podniku:", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5713/api/business/remaining-contacts",
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setRemainingContacts(res.data.remainingContacts);
      } catch (err) {
        console.error("❌ Chyba při načítání kontaktů:", err);
      }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("http://localhost:5713/api/chat/conversations", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setConversations(data);
        } else {
          setConversations([]);
        }
      } catch (err) {
        console.error("❌ Chyba při načítání konverzací:", err);
      }
    };
    const shouldRefresh = sessionStorage.getItem("chatUpdated");
    if (shouldRefresh === "true") {
      fetchConversations();
      sessionStorage.removeItem("chatUpdated");
    } else {
      fetchConversations();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    for (let key in form) formData.append(key, form[key]);
    if (photo) formData.append("photo", photo);

    try {
      const res = await fetch("http://localhost:5713/api/business/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.profile) {
        if (data.profile.photoUrl) {
          setPhotoPreview(`http://localhost:5713${data.profile.photoUrl}`);
        }
        setMessage("✅ Profil byl úspěšně uložen.");
      } else {
        setMessage(`❌ Chyba: ${data.message || "Nepodařilo se uložit."}`);
      }
    } catch (err) {
      console.error("❌ Chyba při ukládání:", err);
      setMessage("❌ Chyba při ukládání.");
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100">
      <div className="row">
        {/* Levý sloupec */}
        <div className="col-md-4">
          <div className="set-custom-card p-3 h-100 set-custom-side-bar">
            {/* Foto + upload */}
            <div className="mb-3 set--input-all">
              <div className="text-center">
                <img
                  src={photoPreview || "/images/avatar-placeholder.png"}
                  alt="Profilová fotka"
                  className="img-fluid rounded-circle"
                  style={{ width: "180px", height: "180px", objectFit: "cover" }}
                />
              </div>
              <input
                type="file"
                accept="image/*"
                className="form-control mt-4"
                onChange={(e) => setPhoto(e.target.files[0])}
              />
            </div>

            {/* Název a lokalita */}
            <div className="set--input-all fw-medium">
              <label>Název firmy:</label>
              <input
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="set--input-all">
              <p>
                <label className="fw-medium">Lokalita:</label>
                <input
                  className="form-control"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                />
              </p>
            </div>

            {/* Zprávy */}
            <div className="mt-4">
              <h5>📨 Zprávy</h5>
              {conversations.length === 0 ? (
                <p className="text-center">Žádné zprávy</p>
              ) : (
                <ul className="list-unstyled set-style-ul-list">
                  {conversations.map((conv) => (
                    <li key={conv.user._id} className="mb-2">
                      <strong>{conv.user.username || conv.user._id}</strong>
                      <br />
                      {conv.unreadCount > 0 && (
                        <span className="fw-bold">
                          🔴 Nová zpráva ({conv.unreadCount})
                        </span>
                      )}
                      <br />
                      <button
                        className="set-btn-white-custom mt-1"
                        onClick={() => navigate(`/chat/${conv.user._id}`)}
                      >
                        Otevřít chat
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Zbývající kontakty */}
            {remainingContacts !== null && (
              <div className="mt-3">
                <strong>Zbývající kontakty:</strong> {remainingContacts}
              </div>
            )}
          </div>
        </div>

        {/* Pravý sloupec */}
        <div className="col-md-7 mx-auto">
          {/* Hlavička se stejným stylem */}
          <header className="text-center py-3 mb-4">
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "22px",
                padding: "12px 22px",
                display: "inline-block",
                border: "1px solid rgb(197, 197, 197)",
                boxShadow:
                  "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
              }}
            >
              <img
                src="/images/logo.png"
                alt="Logo"
                style={{ width: "70px", height: "70px" }}
              />
              <h2
                className="mt-2 text-dark"
                style={{ fontFamily: "'Segoe UI', sans-serif" }}
              >
                MicroMatch
              </h2>
            </div>
          </header>

          {/* Formuláře ve stejném „chip“ stylu labelů */}
          <div className="h-100">
            <div className="row">
              <div className="col-md-6 set--input-all">
                <label>Web:</label>
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="form-control mb-3"
                />
              </div>
              <div className="col-md-6 set--input-all">
                <label>Instagram:</label>
                <input
                  type="text"
                  name="igProfile"
                  value={form.igProfile}
                  onChange={handleChange}
                  className="form-control mb-3"
                />
              </div>
              <div className="col-md-6 set--input-all">
                <label>Facebook:</label>
                <input
                  type="text"
                  name="fbProfile"
                  value={form.fbProfile}
                  onChange={handleChange}
                  className="form-control mb-3"
                />
              </div>
              <div className="col-md-6 set--input-all">
                <label>TikTok:</label>
                <input
                  type="text"
                  name="ttProfile"
                  value={form.ttProfile}
                  onChange={handleChange}
                  className="form-control mb-3"
                />
              </div>
              <div className="col-12 set--input-all">
                <label>Obor podnikání:</label>
                <input
                  type="text"
                  name="businessField"
                  value={form.businessField}
                  onChange={handleChange}
                  className="form-control mb-3"
                />
              </div>
              <div className="col-12 set--input-all">
                <label>Bio:</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows="3"
                  className="form-control mb-3"
                />
              </div>
            </div>

            {/* Akční tlačítka ve stejném stylu */}
            <div className="text-start mt-4">
              <button onClick={handleSave} className="set-btn-custom me-3">
                💾 Uložit profil
              </button>

              <button
                onClick={() => navigate("/influencers")}
                className="set-btn-custom me-3"
              >
                📋 Vybrat influencera
              </button>

              <button
                onClick={() => navigate("/predplatne")}
                className="set-btn-custom me-3"
              >
                📦 Můj balíček
              </button>

              <button
                onClick={() => navigate("/login")}
                className="set-btn-white-custom"
              >
                Odhlásit se
              </button>

              {message && <p className="mt-3">{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessDashboard;

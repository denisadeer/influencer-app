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
        const res = await axios.get("http://localhost:5713/api/business/remaining-contacts", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
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
    <div className="container py-4">
      {/* Oranžová hlavička s logem */}
      <section
        style={{ backgroundColor: "#FFAC76" }}
        className="text-center py-3 mb-4 rounded"
      >
        <img src="/images/logo.png" alt="Logo" style={{ height: "60px" }} />
        <h2 className="logo-font mt-2 mb-0">MicroMatch</h2>
      </section>

      {/* Hlavní rozvržení */}
      <div className="row">
        {/* Levý sloupec */}
        <div className="col-md-6 mb-4">
          <div className="card shadow p-4 mb-4" style={{ backgroundColor: "#FFF0E0" }}>
            <div className="text-center mb-3">
              <img
                src={photoPreview || "/images/avatar-placeholder.png"}
                alt="Profilová fotka"
                className="img-fluid rounded-circle mb-2"
                style={{ width: "200px", height: "200px", objectFit: "cover" }}
              />
              <input
                type="file"
                onChange={(e) => setPhoto(e.target.files[0])}
                accept="image/*"
                className="form-control mt-2"
              />
            </div>
            <h4 className="text-center">{form.name}</h4>
            <p className="text-center text-muted">{form.location}</p>
            <p>
              <strong>Obor podnikání:</strong> {form.businessField}
            </p>
            <label>Bio:</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              className="form-control mb-3"
            />
            <h5>💬 Zprávy</h5>
            {conversations.length === 0 ? (
              <p className="text-center text-muted">📭 Žádné zprávy</p>
            ) : (
              <ul className="list-unstyled">
                {conversations.map((conv) => (
                  <li key={conv.user._id} className="mb-2 border-bottom pb-2">
                    👤 <strong>{conv.user.username || conv.user._id}</strong>
                    <br />
                    {conv.unreadCount > 0 && (
                      <span className="text-danger fw-bold">
                        🔴 Nová zpráva
                      </span>
                    )}
                    <br />
                    <button
                      onClick={() => navigate(`/chat/${conv.user._id}`)}
                      className="btn btn-sm btn-outline-primary mt-1"
                    >
                      Otevřít
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Pravý sloupec */}
        <div className="col-md-6 mb-4">
          <div
            className="card shadow p-4 h-100"
            style={{ backgroundColor: "#fff0E0" }}
          >
            <form className="d-flex flex-column gap-3">
              <label>
                Web:
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="form-control"
                />
              </label>
              <label>
                Instagram:
                <input
                  type="text"
                  name="igProfile"
                  value={form.igProfile}
                  onChange={handleChange}
                  className="form-control"
                />
              </label>
              <label>
                Facebook:
                <input
                  type="text"
                  name="fbProfile"
                  value={form.fbProfile}
                  onChange={handleChange}
                  className="form-control"
                />
              </label>
              <label>
                TikTok:
                <input
                  type="text"
                  name="ttProfile"
                  value={form.ttProfile}
                  onChange={handleChange}
                  className="form-control"
                />
              </label>
              <label>
                Lokalita:
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="form-control"
                />
              </label>
              <label>
                Obor:
                <input
                  type="text"
                  name="businessField"
                  value={form.businessField}
                  onChange={handleChange}
                  className="form-control"
                />
              </label>

              {remainingContacts !== null && (
                <p className="mt-2">
                  <strong>Zbývající kontakty:</strong> {remainingContacts}
                </p>
              )}

              <div className="d-flex justify-content-between mt-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="btn btn-success"
                >
                  💾 Uložit profil
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="btn btn-outline-danger"
                >
                  Odhlásit se
                </button>
              </div>

              <div className="d-flex justify-content-between mt-3">
  <button
    onClick={() => navigate("/influencers")}
    className="btn w-100 me-2"
    style={{ backgroundColor: "#FFAC76", color: "#000", fontWeight: "bold" }}
  >
    📋 Vybrat influencera
  </button>
  <button
    onClick={() => navigate("/predplatne")}
    className="btn w-100 ms-2"
    style={{ backgroundColor: "#FFAC76", color: "#000", fontWeight: "bold" }}
  >
    📦 Můj balíček
  </button>
</div>


              {message && <p className="text-center mt-3">{message}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessDashboard;

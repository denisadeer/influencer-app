// src/components/BusinessDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function BusinessDashboard() {
  console.log("✅ BusinessDashboard NAČTEN a běží");

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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      console.log("🔄 Načítám profil podniku...");

      try {
        const res = await fetch("http://localhost:5713/api/business/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("📥 Odpověď serveru:", data);

        if (res.ok && data.profile) {
          const {
            name = "",
            website = "",
            igProfile = "",
            fbProfile = "",
            ttProfile = "",
            bio = "",
            location = "",
            businessField = "",
          } = data.profile;

          setForm({
            name,
            website,
            igProfile,
            fbProfile,
            ttProfile,
            bio,
            location,
            businessField,
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
        const res = await axios.get("http://localhost:5713/api/influencer/remaining-contacts", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setRemainingContacts(res.data.remainingContacts);
      } catch (err) {
        console.error("❌ Chyba při načítání kontaktů:", err);
      }
    };

    fetchContacts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    for (let key in form) {
      formData.append(key, form[key]);
    }
    if (photo) formData.append("photo", photo);

    for (let pair of formData.entries()) {
      console.log("🧾 FORM DATA:", pair[0], pair[1]);
    }

    try {
      const res = await fetch("http://localhost:5713/api/business/profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      console.log("💾 Výsledek uložení:", data);

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
      setMessage("❌ Chyba při odesílání na server.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ color: "blue" }}>TEST — JSI V BUSINESS DASHBOARDU</h1>
      <h2>Profil podniku</h2>

      {photoPreview && (
        <img src={photoPreview} alt="Profilová fotka" style={{ maxWidth: 200 }} />
      )}

      <form style={{ display: "flex", flexDirection: "column", maxWidth: 400 }}>
        <label>Název podniku:
          <input type="text" name="name" value={form.name} onChange={handleChange} />
        </label>

        <label>Webové stránky:
          <input type="text" name="website" value={form.website} onChange={handleChange} />
        </label>

        <label>Instagram profil:
          <input type="text" name="igProfile" value={form.igProfile} onChange={handleChange} />
        </label>

        <label>Facebook profil:
          <input type="text" name="fbProfile" value={form.fbProfile} onChange={handleChange} />
        </label>

        <label>TikTok profil:
          <input type="text" name="ttProfile" value={form.ttProfile} onChange={handleChange} />
        </label>

        <label>Lokalita:
          <input type="text" name="location" value={form.location} onChange={handleChange} />
        </label>

        <label>Obor podnikání:
          <input type="text" name="businessField" value={form.businessField} onChange={handleChange} />
        </label>

        <label>Bio:
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} />
        </label>

        <label>Profilová fotka:
          <input type="file" onChange={(e) => setPhoto(e.target.files[0])} accept="image/*" />
        </label>

        {remainingContacts !== null && (
          <p><strong>Zbývající kontakty:</strong> {remainingContacts}</p>
        )}

        <button type="button" style={{ marginTop: "1rem" }} onClick={handleSave}>
          Uložit profil
        </button>
      </form>

      <div style={{ marginTop: "2rem" }}>
        <button onClick={() => navigate("/influencers")}>
          Vybrat influencera
        </button>
       <button onClick={() => navigate("/predplatne")} style={{ marginLeft: "1rem" }}>
          Můj balíček
        </button>
      </div>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}

export default BusinessDashboard;

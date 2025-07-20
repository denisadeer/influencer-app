import React, { useState, useEffect } from "react";

function InfluencerDashboard() {
  const [form, setForm] = useState({
    name: "",
    igNickname: "",
    ttNickname: "",
    fbNickname: "",
    gender: "",
    age: "",
    location: "",
    interests: "",
    cooperationType: [],
    igFollowers: "",
    ttFollowers: "",
    fbFollowers: "",
    bio: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [message, setMessage] = useState("");

  console.log("🧩 InfluencerDashboard byl načten.");

  useEffect(() => {
    console.log("📦 useEffect v InfluencerDashboard byl spuštěn");
    const fetchProfile = async () => {
      console.log("🔄 Spouštím načítání profilu...");
      const token = localStorage.getItem("token");
      console.log("🔑 Token:", token);

      try {
        const res = await fetch("http://localhost:5713/api/influencer/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("📥 Odpověď serveru:", data);

        if (res.ok && data.profile) {
          console.log("✅ Profil načten:", data.profile);
          setForm(data.profile);
          if (data.profile.photoUrl) {
            setPhotoPreview(`http://localhost:5713${data.profile.photoUrl}`);
          }
        } else {
          console.warn("⚠️ Nepodařilo se načíst profil.");
        }
      } catch (err) {
        console.error("❌ Chyba při načítání profilu:", err);
      }
    };

    fetchProfile();
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
    if (photo) {
      formData.append("photo", photo);
    }

    try {
      const response = await fetch("http://localhost:5713/api/influencer/profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log("💾 Výsledek uložení:", data);

      if (response.ok) {
        setMessage("✅ Úspěšně uloženo na server.");
        if (data.profile?.photoUrl) {
          setPhotoPreview(`http://localhost:5713${data.profile.photoUrl}`);
        }
      } else {
        setMessage(`❌ Chyba: ${data.message || "Nepodařilo se uložit."}`);
      }
    } catch (err) {
      console.error("❌ Chyba při odesílání na server:", err);
      setMessage("❌ Chyba při odesílání na server.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Influencer profil</h2>

      {photoPreview && (
        <div style={{ marginBottom: "1rem" }}>
          <p>📸 Aktuální profilová fotka:</p>
          <img
            src={photoPreview}
            alt="Profilová fotka"
            style={{ maxWidth: "200px", borderRadius: "8px" }}
          />
        </div>
      )}

      <form style={{ display: "flex", flexDirection: "column", maxWidth: "400px" }}>
        <label>Jméno:
          <input type="text" name="name" value={form.name} onChange={handleChange} />
        </label>

        <label>Přezdívka na IG:
          <input type="text" name="igNickname" value={form.igNickname} onChange={handleChange} />
        </label>

        <label>Přezdívka na TT:
          <input type="text" name="ttNickname" value={form.ttNickname} onChange={handleChange} />
        </label>

        <label>Přezdívka na FB:
          <input type="text" name="fbNickname" value={form.fbNickname} onChange={handleChange} />
        </label>

        <label>Pohlaví:
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">-- Vyberte --</option>
            <option value="muž">Muž</option>
            <option value="žena">Žena</option>
            <option value="jiné">Jiné</option>
          </select>
        </label>

        <label>Věk:
          <input type="number" name="age" value={form.age} onChange={handleChange} />
        </label>

        <label>Lokalita:
          <input type="text" name="location" value={form.location} onChange={handleChange} />
        </label>

        <label>Zájmy (co chceš propagovat):
          <input type="text" name="interests" value={form.interests} onChange={handleChange} />
        </label>

        <fieldset style={{ marginTop: "1rem" }}>
          <legend>Typ spolupráce:</legend>
          <label>
            <input
              type="checkbox"
              checked={form.cooperationType?.includes("bartr")}
              onChange={(e) => {
                const updated = e.target.checked
                  ? [...(form.cooperationType || []), "bartr"]
                  : (form.cooperationType || []).filter((val) => val !== "bartr");
                setForm((prev) => ({ ...prev, cooperationType: updated }));
              }}
            />
            Bartr
          </label>

          <label style={{ marginLeft: "1rem" }}>
            <input
              type="checkbox"
              checked={form.cooperationType?.includes("odměna")}
              onChange={(e) => {
                const updated = e.target.checked
                  ? [...(form.cooperationType || []), "odměna"]
                  : (form.cooperationType || []).filter((val) => val !== "odměna");
                setForm((prev) => ({ ...prev, cooperationType: updated }));
              }}
            />
            Finanční odměna
          </label>
        </fieldset>

        <label>Počet sledujících na IG:
          <input type="number" name="igFollowers" value={form.igFollowers} onChange={handleChange} />
        </label>

        <label>Počet sledujících na TT:
          <input type="number" name="ttFollowers" value={form.ttFollowers} onChange={handleChange} />
        </label>

        <label>Počet sledujících na FB:
          <input type="number" name="fbFollowers" value={form.fbFollowers} onChange={handleChange} />
        </label>

        <label>Bio:
          <textarea name="bio" value={form.bio} onChange={handleChange} rows="4" />
        </label>

        <label>Profilová fotka:
          <input type="file" onChange={(e) => setPhoto(e.target.files[0])} accept="image/*" />
        </label>

        <button type="button" style={{ marginTop: "1rem" }} onClick={handleSave}>
          Uložit profil
        </button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}

export default InfluencerDashboard;

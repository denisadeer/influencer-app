import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function InfluencerDashboard() {
  console.log("✅ InfluencerDashboard NAČTEN a běží");

  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);

  // 📨 Načti příchozí zprávy
  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      try {
        const res = await fetch(`http://localhost:5713/api/chat/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const messages = await res.json();

        const sendersMap = {};
        messages.forEach((msg) => {


          if (
    String(msg.receiverId?._id || msg.receiverId) === userId &&
    msg.senderId &&
    msg.senderId._id
  ) {
    sendersMap[msg.senderId._id] = msg.senderId;
  }
});

        const uniqueSenders = Object.values(sendersMap);
        setConversations(uniqueSenders);
      } catch (err) {
        console.error("❌ Chyba při načítání zpráv:", err);
      }
    };

    fetchMessages();
  }, []);

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
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      console.log("🔄 Načítám profil z backendu...");
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5713/api/influencer/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("📅 Odpověď serveru:", data);

        if (res.ok && data.profile) {
          setForm(data.profile);
          if (data.profile.photoUrl) {
            setPhotoPreview(`http://localhost:5713${data.profile.photoUrl}`);
          }
        } else {
          setStatusMessage("⚠️ Profil zatím neexistuje nebo chyba načtení.");
        }
      } catch (err) {
        console.error("❌ Chyba při načítání profilu:", err);
        setStatusMessage("❌ Chyba při načítání profilu");
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

    for (let pair of formData.entries()) {
      console.log(pair[0] + ":", pair[1]);
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
      console.log("📂 Výsledek uložení:", data);

      if (response.ok) {
        setStatusMessage("✅ Úspěšně uloženo na server.");
        if (data.profile?.photoUrl) {
          setPhotoPreview(`http://localhost:5713${data.profile.photoUrl}`);
        }
      } else {
        setStatusMessage(`❌ Chyba: ${data.message || "Nepodařilo se uložit."}`);
      }
    } catch (err) {
      console.error("❌ Chyba při odesílání na server:", err);
      setStatusMessage("❌ Chyba při odesílání na server.");
    }
  };

  const handleDeletePhoto = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5713/api/influencer/profile/photo", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("🗑️ Výsledek mazání:", data);

      if (res.ok) {
        setPhotoPreview(null);
        setStatusMessage("✅ Fotka byla smazána.");
      } else {
        setStatusMessage("❌ Mazání selhalo: " + data.message);
      }
    } catch (err) {
      console.error("❌ Chyba při mazání fotky:", err);
      setStatusMessage("❌ Chyba při mazání fotky");
    }
  };

  const handleOpenChat = (senderId) => {
    navigate(`/chat/${senderId}`);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ color: "red" }}>TEST — JSEM V INFLUENCER DASHBOARDU</h1>
      <h2>Influencer profil</h2>

      {photoPreview && (
        <div style={{ marginBottom: "1rem" }}>
          <p>📸 Aktuální fotka:</p>
          <img
            src={photoPreview}
            alt="Profilová fotka"
            style={{ maxWidth: "200px", borderRadius: "8px" }}
          />
          <button
            type="button"
            onClick={handleDeletePhoto}
            style={{ marginTop: "0.5rem", background: "darkred", color: "white", padding: "0.5rem" }}
          >
            Smazat fotku
          </button>
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

        <label>Zájmy:
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

        <label>IG followers:
          <input type="number" name="igFollowers" value={form.igFollowers} onChange={handleChange} />
        </label>

        <label>TT followers:
          <input type="number" name="ttFollowers" value={form.ttFollowers} onChange={handleChange} />
        </label>

        <label>FB followers:
          <input type="number" name="fbFollowers" value={form.fbFollowers} onChange={handleChange} />
        </label>

        <label>Bio:
          <textarea name="bio" value={form.bio} onChange={handleChange} rows="4" />
        </label>

        <label>Profilová fotka:
          <input type="file" onChange={(e) => setPhoto(e.target.files[0])} accept="image/*" />
        </label>

        <button type="button" onClick={handleSave} style={{ marginTop: "1rem" }}>
          Uložit profil
        </button>
      </form>

      {statusMessage && <p style={{ marginTop: "1rem" }}>{statusMessage}</p>}

      <div style={{ marginTop: "3rem" }}>
        <h3>📬 Příchozí zprávy od podniků</h3>
        {conversations.length === 0 ? (
          <p>Žádné zprávy zatím nepřišly.</p>
        ) : (
          <ul>
            {conversations.map((sender) => (
              <li key={sender._id} style={{ marginBottom: "1rem" }}>
                <strong>Podnik:</strong> {sender.username || sender._id}
                <br />
                <button onClick={() => handleOpenChat(sender._id)}>
                  📨 Otevřít chat
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default InfluencerDashboard;

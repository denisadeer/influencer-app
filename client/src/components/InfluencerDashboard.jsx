    import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboardInfluencer.css";

function InfluencerDashboard() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [username, setUsername] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5713/api/influencer/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.profile) {
          setForm(data.profile);
          setUsername(data.profile.username || data.profile.name || "");
          if (data.profile.photoUrl) {
            setPhotoPreview(`http://localhost:5713${data.profile.photoUrl}`);
          }
        } else {
          setStatusMessage("⚠️ Profil zatím neexistuje nebo chyba načtení.");
        }
      } catch (err) {
        console.error("❌ Chyba při načítání profilu:", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5713/api/chat/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const messages = await res.json();
        const convoMap = new Map();
        messages.forEach((msg) => {
          const sender = msg.senderId;
          if (!sender || !sender._id) return;
          const isForMe = String(msg.receiverId?._id || msg.receiverId) === userId;
          if (isForMe) {
            const senderId = sender._id;
            const existing = convoMap.get(senderId) || {
              userId: senderId,
              username: sender.username || "neznámý",
              unreadCount: 0,
            };
            if (!msg.read) existing.unreadCount += 1;
            convoMap.set(senderId, existing);
          }
        });
        setConversations(Array.from(convoMap.values()));
      } catch (err) {
        console.error("❌ Chyba při načítání zpráv:", err);
      }
    };
    fetchMessages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    for (let key in form) {
      formData.append(key, form[key]);
    }
    if (photo) formData.append("photo", photo);
    try {
      const response = await fetch("http://localhost:5713/api/influencer/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setStatusMessage("✅ Úspěšně uloženo na server.");
        if (data.profile?.photoUrl) {
          setPhotoPreview(`http://localhost:5713${data.profile.photoUrl}`);
        }
      } else {
        setStatusMessage(`❌ Chyba: ${data.message || "Nepodařilo se uložit."}`);
      }
    } catch (err) {
      console.error("❌ Chyba při ukládání:", err);
      setStatusMessage("❌ Chyba při ukládání");
    }
  };

  const handleDeletePhoto = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5713/api/influencer/profile/photo", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPhotoPreview(null);
        setStatusMessage("✅ Fotka byla smazána.");
      } else {
        setStatusMessage("❌ Mazání selhalo: " + data.message);
      }
    } catch (err) {
      console.error("❌ Chyba při mazání fotky:", err);
    }
  };

  const handleOpenChat = (senderId) => {
    navigate(`/chat/${senderId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="container-fluid bg-light min-vh-100">
      <div className="row">
        {/* Levý sloupec */}
        <div className="col-md-4">
          <div className="set-custom-card p-3 h-100 set-custom-side-bar">
            <div className="mb-3 set--input-all">
              <div className="text-center">
                <img
                src={photoPreview || "/images/avatar-placeholder.png"}
                alt="Profilová fotka"
                className="img-fluid rounded-circle"
                style={{ width: "240px", height: "240px", objectFit: "cover" }}
              />
              </div>
              <input type="file" accept="image/*" className="form-control mt-4" onChange={(e) => setPhoto(e.target.files[0])} />
              {photoPreview && (
                <button onClick={handleDeletePhoto} className="set-btn-white-custom mt-3">Smazat fotku</button>
              )}
            </div>

            <div className="set--input-all fw-medium"><label>Jméno:</label> <input className="form-control" name="name" value={form.name} onChange={handleChange} /></div>
            <div className="set--input-all">
              <p><label className="fw-medium">Lokalita:</label> <input className="form-control" name="location" value={form.location} onChange={handleChange} /></p>
            </div>
            <div className="mt-4">
              <h5 className="">📨 Zprávy</h5>
              {conversations.length === 0 ? (
                <p className="text-center">Žádné zprávy</p>
              ) : (
                <ul className="list-unstyled set-style-ul-list">
                  {conversations.map((sender) => (
                    <li key={sender.userId} className="mb-2">
                      <strong className="">{sender.username}</strong><br />
                      {sender.unreadCount > 0 && (
                        <span className="fw-bold">
                          🔴 Nová zpráva ({sender.unreadCount})
                        </span>
                      )}<br />
                      <button className="set-btn-white-custom mt-1" onClick={() => handleOpenChat(sender.userId)}>Otevřít chat</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Pravý sloupec */}
        <div className="col-md-7 mx-auto">
          <header className="text-center py-3 mb-4" >
        <div style={{ backgroundColor: "#fff", borderRadius: "22px", padding: "12px 22px", display: "inline-block", border: "1px solid rgb(197, 197, 197)", boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"  }}>
          <img src="/images/logo.png" alt="Logo" style={{ width: "70px", height: "70px" }} />
          <h2 className="mt-2 text-dark" style={{ fontFamily: "'Segoe UI', sans-serif" }}>MicroMatch</h2>
        </div>
      </header>
          <div className="h-100">
            <div>
              <div className="row">
                <div className="col-md-6 set--input-all">
                  <label>IG Nickname:</label>
                  <input type="text" name="igNickname" value={form.igNickname} onChange={handleChange} className="form-control mb-3" />
                </div>
                <div className="col-md-6 set--input-all">
                  <label>TT Nickname:</label>
                  <input type="text" name="ttNickname" value={form.ttNickname} onChange={handleChange} className="form-control mb-3" />
                </div>
                <div className="col-md-6 set--input-all">
                  <label>FB Nickname:</label>
                  <input type="text" name="fbNickname" value={form.fbNickname} onChange={handleChange} className="form-control mb-3" />
                </div>
                <div className="col-md-6 set--input-all">
                  <label>IN Nickname:</label>
                  <input type="text" name="inNickname" value={form.inNickname} onChange={handleChange} className="form-control mb-3" />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 set--input-all">
                  <label>IG Followers:</label>
                  <input type="number" name="igFollowers" value={form.igFollowers} onChange={handleChange} className="form-control mb-3" />
                </div>
                <div className="col-md-4 set--input-all">
                  <label>TT Followers:</label>
                  <input type="number" name="ttFollowers" value={form.ttFollowers} onChange={handleChange} className="form-control mb-3" />
                </div>
                <div className="col-md-4 set--input-all">
                  <label>FB Followers:</label>
                  <input type="number" name="fbFollowers" value={form.fbFollowers} onChange={handleChange} className="form-control mb-3" />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 set--input-all">
                  <label>Zájmy:</label>
                  <input type="text" name="interests" value={form.interests} onChange={handleChange} className="form-control mb-3" />
                </div>
                <div className="col-md-3 set--input-all">
                  <label>Pohlaví:</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className="form-select mb-3">
                    <option value="">-- Vyberte --</option>
                    <option value="muž">Muž</option>
                    <option value="žena">Žena</option>
                    <option value="jiné">Jiné</option>
                  </select>
                </div>
                <div className="col-md-3 set--input-all">
                  <label>Věk:</label>
                  <input type="number" name="age" value={form.age} onChange={handleChange} className="form-control mb-3" />
                </div>
              </div>

              <fieldset className="mb-4">
                <legend>Zájem o spolupráci:</legend>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="checkbox" checked={form.cooperationType.includes("bartr")} onChange={(e) => {
                    const updated = e.target.checked ? [...form.cooperationType, "bartr"] : form.cooperationType.filter((val) => val !== "bartr");
                    setForm((prev) => ({ ...prev, cooperationType: updated }));
                  }} />
                  <label className="form-check-label">Bartr</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="checkbox" checked={form.cooperationType.includes("odměna")} onChange={(e) => {
                    const updated = e.target.checked ? [...form.cooperationType, "odměna"] : form.cooperationType.filter((val) => val !== "odměna");
                    setForm((prev) => ({ ...prev, cooperationType: updated }));
                  }} />
                  <label className="form-check-label">Finanční odměna</label>
                </div>
              </fieldset>
              <div className="set--input-all">    
                <label>Bio:</label>
                <textarea className="form-control mb-3" rows="3" name="bio" value={form.bio} onChange={handleChange}></textarea>
              </div>
            </div>

            <div className="text-start mt-4">
              <button onClick={handleSave} className="set-btn-custom  me-3">💾 Uložit profil</button>
             
              {statusMessage && <p className="mt-3">{statusMessage}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfluencerDashboard;

    

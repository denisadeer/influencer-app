import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/dashboardInfluencer.css";

const API_BASE = "http://localhost:5713";

const AdminUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [remainingOverrideInput, setRemainingOverrideInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_BASE}/api/admin/user-profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setProfile(data.profile || {});
          setRemainingOverrideInput(data.user.remainingContactOverride ?? "");
        } else {
          setMessage(data.message || "Chyba při načítání profilu");
        }
      } catch (err) {
        setMessage("❌ Chyba při komunikaci se serverem.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/admin/user-profile/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileUpdates: profile,
          userUpdates: { subscriptionPlan: user.subscriptionPlan || "" },
        }),
      });
      const data = await res.json();
      setMessage(res.ok ? "✅ Úspěšně uloženo." : data.message || "❌ Chyba při ukládání.");
    } catch {
      setMessage("❌ Chyba komunikace se serverem.");
    }
  };

  const handleRemainingOverrideUpdate = async () => {
    const token = localStorage.getItem("token");
    const parsed = parseInt(remainingOverrideInput);
    if (isNaN(parsed) || parsed < 0) {
      setMessage("❌ Zadej platné číslo pro zbývající kontakty.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/user/${userId}/remaining-override`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ newRemainingContactOverride: parsed }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({ ...prev, remainingContactOverride: parsed }));
        setMessage("✅ Zbývající kontakty upraveny.");
      } else {
        setMessage(data.message || "❌ Chyba při úpravě zbývajících kontaktů.");
      }
    } catch {
      setMessage("❌ Chyba komunikace se serverem.");
    }
  };

  if (loading) return <p>Načítám...</p>;
  if (!user) return <p>{message || "❌ Uživatel nenalezen."}</p>;

  const allowed = user.allowedContacts ?? 0;
  const used = user.contactsUsedThisMonth ?? 0;
  const override = user.remainingContactOverride;
  const remaining = override != null ? override : allowed - used;

  return (
    <div className="container-fluid bg-light min-vh-100">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          {/* Hlavička */}
          <header className="text-center py-3 mb-4">
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: 22,
                padding: "12px 22px",
                display: "inline-block",
                border: "1px solid rgb(197,197,197)",
                boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px",
              }}
            >
              <img src="/images/logo.png" alt="Logo" style={{ width: 70, height: 70 }} />
              <h2 className="mt-2 text-dark">MicroMatch – Admin Profil</h2>
            </div>
          </header>

          {/* Obsah */}
          <div className="set-custom-side-bar p-4" style={{ borderRadius: 10 }}>
            <button onClick={() => navigate(-1)} className="set-btn-white-custom mb-3">
              ← Zpět
            </button>

            <h4>👤 {user.username}</h4>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Email ověřen:</strong> {user.emailVerified ? "✅" : "❌"}</p>

            <div className="set--input-all my-3">
              <label>Plán:</label>
              <select
                className="form-select"
                value={user.subscriptionPlan || ""}
                onChange={(e) => setUser((prev) => ({ ...prev, subscriptionPlan: e.target.value }))}
              >
                <option value="">—</option>
                <option value="free">free</option>
                <option value="basic">basic</option>
                <option value="pro">pro</option>
              </select>
            </div>

            <p>📦 Kontakty dle balíčku: <strong>{allowed}</strong></p>
            <p>📊 Kontakty použité: <strong>{used}</strong></p>
            <p>🟢 Zbývající: <strong>{remaining}</strong></p>
            <p>
              Reset balíčku od:{" "}
              <strong>{user.subscriptionStartDate ? new Date(user.subscriptionStartDate).toLocaleDateString() : "—"}</strong>
            </p>

            <div className="set--input-all my-3">
              <label>🛠️ Přepsat zbývající kontakty:</label>
              <input
                type="number"
                className="form-control"
                value={remainingOverrideInput}
                onChange={(e) => setRemainingOverrideInput(e.target.value)}
              />
              <button onClick={handleRemainingOverrideUpdate} className="set-btn-custom mt-2">
                💾 Uložit zbývající
              </button>
            </div>

            {profile.photoUrl && (
              <div className="my-3">
                <p>📷 Profilová fotka:</p>
                <img
                  src={`${API_BASE}${profile.photoUrl}`}
                  alt="Profilová fotka"
                  style={{ maxWidth: "200px", borderRadius: 8 }}
                />
                <button
                  className="set-btn-white-custom mt-2"
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    try {
                      const res = await fetch(`${API_BASE}/api/admin/user-profile/${userId}/photo`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setProfile((prev) => ({ ...prev, photoUrl: null }));
                        setMessage("✅ Fotka byla smazána.");
                      } else {
                        setMessage("❌ Mazání selhalo: " + (data.message || ""));
                      }
                    } catch {
                      setMessage("❌ Chyba při mazání fotky.");
                    }
                  }}
                >
                  🗑️ Smazat fotku
                </button>
              </div>
            )}

            <hr />
            <h5>📋 Detail profilu ({user.role})</h5>
            {Object.keys(profile).length === 0 && (
              <p className="text-muted">Tento uživatel zatím nemá vyplněný profil.</p>
            )}

            <form className="d-flex flex-column gap-2">
              {Object.entries(profile).map(
                ([key, val]) =>
                  !["_id", "userId", "__v", "photoUrl"].includes(key) && (
                    <div key={key} className="set--input-all">
                      <label>{key}:</label>
                      <input
                        type="text"
                        name={key}
                        className="form-control"
                        value={val ?? ""}
                        onChange={handleChange}
                      />
                    </div>
                  )
              )}
              <button type="button" onClick={handleSave} className="set-btn-custom mt-3">
                💾 Uložit změny
              </button>
            </form>

            {message && <p className="mt-3">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfile;

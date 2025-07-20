import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AdminUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [contactLimit, setContactLimit] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(`/api/admin/user-profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setProfile(data.profile || {});
          setContactLimit(data.user.allowedContacts ?? "");
        } else {
          setMessage(data.message || "Chyba při načítání profilu");
        }
      } catch (err) {
        setMessage("Chyba při komunikaci se serverem.");
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
      const res = await fetch(`/api/admin/user-profile/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileUpdates: profile,
          userUpdates: {
            subscriptionPlan: user.subscriptionPlan || "",
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Úspěšně uloženo.");
      } else {
        setMessage(data.message || "❌ Chyba při ukládání.");
      }
    } catch (err) {
      setMessage("❌ Chyba komunikace se serverem.");
    }
  };

  const handleContactUpdate = async () => {
    const token = localStorage.getItem("token");

    const parsed = parseInt(contactLimit);
    if (isNaN(parsed) || parsed < 0) {
      setMessage("❌ Zadej platné číslo pro počet kontaktů.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/user/${userId}/contacts`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newContactLimit: parsed }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({ ...prev, allowedContacts: parsed }));
        setMessage("✅ Počet kontaktů aktualizován.");
      } else {
        setMessage(data.message || "❌ Chyba při úpravě kontaktů.");
      }
    } catch (err) {
      setMessage("❌ Chyba při komunikaci se serverem.");
    }
  };

  if (loading) return <p>Načítám...</p>;
  if (!user) return <p>{message || "Uživatel nenalezen."}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => navigate(-1)}>⬅️ Zpět</button>
      <h2>Profil uživatele – {user.username}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Email ověřen: {user.emailVerified ? "✅" : "❌"}</p>

      <label style={{ margin: "0.5rem 0", display: "block" }}>
        Plán:
        <select
          value={user.subscriptionPlan || ""}
          onChange={(e) =>
            setUser((prev) => ({ ...prev, subscriptionPlan: e.target.value }))
          }
          style={{ marginLeft: "1rem" }}
        >
          <option value="">—</option>
          <option value="basic">basic</option>
          <option value="pro">pro</option>
        </select>
      </label>

      <p>
        Kontakty povoleno:{" "}
        <strong>{user.allowedContacts ?? "—"}</strong>
      </p>
      <p>
        Reset balíčku od:{" "}
        <strong>
          {user.subscriptionStartDate
            ? new Date(user.subscriptionStartDate).toLocaleDateString()
            : "—"}
        </strong>
      </p>

      <label style={{ margin: "1rem 0", display: "block" }}>
        🛠️ Upravit počet kontaktů:
        <input
          type="number"
          value={contactLimit}
          onChange={(e) => setContactLimit(e.target.value)}
          style={{ marginLeft: "1rem", width: "100px" }}
        />
        <button onClick={handleContactUpdate} style={{ marginLeft: "1rem" }}>
          💾 Uložit
        </button>
      </label>

      {profile.photoUrl && (
        <div style={{ margin: "1rem 0" }}>
          <p>Profilová fotka:</p>
          <img
            src={`http://localhost:5713${profile.photoUrl}`}
            alt="Profilová fotka"
            style={{ maxWidth: "200px", borderRadius: "8px" }}
          />
          <button
            onClick={async () => {
              const token = localStorage.getItem("token");
              try {
                const res = await fetch(
                  `/api/admin/user-profile/${userId}/photo`,
                  {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                const data = await res.json();
                if (res.ok) {
                  setProfile((prev) => ({ ...prev, photoUrl: null }));
                  setMessage("✅ Fotka byla smazána.");
                } else {
                  setMessage("❌ Mazání selhalo: " + (data.message || ""));
                }
              } catch (err) {
                setMessage("❌ Chyba při mazání fotky.");
              }
            }}
            style={{
              marginTop: "0.5rem",
              background: "darkred",
              color: "white",
              padding: "0.5rem",
              border: "none",
              borderRadius: "4px",
            }}
          >
            🗑️ Smazat fotku
          </button>
        </div>
      )}

      <hr />
      <h3>Profil ({user.role})</h3>

      <form
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "400px",
        }}
      >
        {Object.keys(profile).length === 0 && (
          <p style={{ fontStyle: "italic", color: "gray" }}>
            Tento uživatel zatím nemá vyplněný profil.
          </p>
        )}

        {Object.entries(profile).map(
          ([key, val]) =>
            key !== "_id" &&
            key !== "userId" &&
            key !== "__v" &&
            key !== "photoUrl" && (
              <label key={key} style={{ marginBottom: "0.5rem" }}>
                {key}:
                <input
                  type="text"
                  name={key}
                  value={val ?? ""}
                  onChange={handleChange}
                />
              </label>
            )
        )}

        <button type="button" onClick={handleSave} style={{ marginTop: "1rem" }}>
          💾 Uložit změny
        </button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
};

export default AdminUserProfile;

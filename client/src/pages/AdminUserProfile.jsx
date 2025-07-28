import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AdminUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [contactLimitInput, setContactLimitInput] = useState("");
  const [remainingOverrideInput, setRemainingOverrideInput] = useState("");

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
          setContactLimitInput(data.user.allowedContacts ?? "");
          setRemainingOverrideInput(data.user.remainingContactOverride ?? "");
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
    const parsed = parseInt(contactLimitInput);

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

  const handleRemainingOverrideUpdate = async () => {
    const token = localStorage.getItem("token");
    const parsed = parseInt(remainingOverrideInput);

    if (isNaN(parsed) || parsed < 0) {
      setMessage("❌ Zadej platné číslo pro zbývající kontakty.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/user/${userId}/remaining-override`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newRemainingContactOverride: parsed }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser((prev) => ({
          ...prev,
          remainingContactOverride: parsed,
        }));
        setMessage("✅ Zbývající kontakty upraveny.");
      } else {
        setMessage(data.message || "❌ Chyba při úpravě zbývajících kontaktů.");
      }
    } catch (err) {
      setMessage("❌ Chyba komunikace se serverem.");
    }
  };

  if (loading) return <p>Načítám...</p>;
  if (!user) return <p>{message || "Uživatel nenalezen."}</p>;

  const allowed = user.allowedContacts ?? 0;
  const used = user.contactsUsedThisMonth ?? 0;
  const override = user.remainingContactOverride;
  const remaining = override != null ? override : allowed - used;

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
          <option value="free">free</option>
          <option value="basic">basic</option>
          <option value="pro">pro</option>
        </select>
      </label>

      <p>Kontakty dle balíčku: <strong>{allowed}</strong></p>
      <p>Kontakty použité: <strong>{used}</strong></p>
      <p>Zbývající kontakty: <strong>{remaining}</strong></p>
      <p>
        Reset balíčku od:{" "}
        <strong>
          {user.subscriptionStartDate
            ? new Date(user.subscriptionStartDate).toLocaleDateString()
            : "—"}
        </strong>
      </p>

      <label style={{ margin: "1rem 0", display: "block" }}>
        🛠️ Přepsat zbývající kontakty:
        <input
          type="number"
          value={remainingOverrideInput}
          onChange={(e) => setRemainingOverrideInput(e.target.value)}
          style={{ marginLeft: "1rem", width: "100px" }}
        />
        <button onClick={handleRemainingOverrideUpdate} style={{ marginLeft: "1rem" }}>
          💾 Uložit zbývající
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

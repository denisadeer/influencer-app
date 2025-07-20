import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function InfluencerDetail() {
  console.log("🔍 InfluencerDetail načten");
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:5713/api/influencer/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          console.warn("⚠️ Server vrátil chybu:", errData);
          setError(errData.message || "Neznámá chyba.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setProfile(data.profile);
      } catch (err) {
        console.error("❌ Chyba při fetchi detailu profilu:", err);
        setError("Chyba při načítání profilu.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleStartChat = () => {
    if (profile?.userId) {
      navigate(`/chat/${profile.userId}`);
    } else {
      console.error("❌ Tento influencer nemá přiřazený User účet.");
      alert("Tento influencer nemá přiřazený účet. Napiš vývojáři.");
    }
  };

  if (loading) {
    return (
      <>
        <p>⏳ Načítám profil...</p>
        <p>✅ Komponenta se načetla</p>
      </>
    );
  }

  if (error || !profile) {
    return <p>❌ Profil nelze zobrazit: {error}</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📄 Detail profilu influencera</h2>
      <p><strong>Jméno:</strong> {profile.name}</p>
      <p><strong>Lokalita:</strong> {profile.location}</p>
      <p><strong>Bio:</strong> {profile.bio}</p>
      <p><strong>Zájmy:</strong> {profile.interests}</p>
      <p><strong>Věk:</strong> {profile.age}</p>
      <p><strong>Pohlaví:</strong> {profile.gender}</p>
      <p><strong>Instagram:</strong> {profile.igNickname}</p>
      <p><strong>TikTok:</strong> {profile.ttNickname}</p>
      <p><strong>Facebook:</strong> {profile.fbNickname}</p>
      <p><strong>Sledovatelé IG:</strong> {profile.igFollowers}</p>
      <p><strong>Sledovatelé TikTok:</strong> {profile.ttFollowers}</p>
      <p><strong>Sledovatelé FB:</strong> {profile.fbFollowers}</p>
      {profile.photoUrl && (
        <img
          src={`http://localhost:5713${profile.photoUrl}`}
          alt="Profilová fotka"
          style={{ maxWidth: "200px", marginTop: "1rem" }}
        />
      )}

      {/* 🟢 Tlačítko pro zahájení chatu */}
      <div style={{ marginTop: "2rem" }}>
        <button onClick={handleStartChat}>💬 Zahájit chat s influencerem</button>
      </div>
    </div>
  );
}

export default InfluencerDetail;


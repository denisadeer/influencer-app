import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function PublicBusinessProfile() {
  const { id } = useParams(); // ← Získání ID z URL
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/public/business/${id}`);
        setProfile(res.data); // ← ✅ OPRAVENO: používáme přímo res.data
      } catch (err) {
        console.error("❌ Chyba při načítání veřejného profilu podniku:", err);
      }
    };

    fetchProfile();
  }, [id]);

  if (!profile) return <div>Načítám veřejný profil podniku...</div>;

  return (
    <div className="container">
      <h2>Veřejný profil podniku</h2>

      {profile.photoUrl && (
        <img
          src={`http://localhost:5713${profile.photoUrl}`} // přidáme doménu backendu
  alt="Profilová fotka"
  style={{ width: "200px", borderRadius: "8px" }}
        />
      )}

      <p><strong>Název:</strong> {profile.name}</p>
      <p><strong>Obor podnikání:</strong> {profile.businessField}</p>
      <p><strong>Lokalita:</strong> {profile.location}</p>
      <p><strong>Web:</strong> <a href={profile.website} target="_blank" rel="noreferrer">{profile.website}</a></p>
      <p><strong>Instagram:</strong> <a href={profile.igProfile} target="_blank" rel="noreferrer">{profile.igProfile}</a></p>
      <p><strong>Facebook:</strong> <a href={profile.fbProfile} target="_blank" rel="noreferrer">{profile.fbProfile}</a></p>
      <p><strong>TikTok:</strong> <a href={profile.ttProfile} target="_blank" rel="noreferrer">{profile.ttProfile}</a></p>
      <p><strong>Bio:</strong> {profile.bio}</p>
    </div>
  );
}

export default PublicBusinessProfile;

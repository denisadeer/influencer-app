import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function InfluencerDetail() {
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
      alert("Tento influencer nemá přiřazený účet.");
    }
  };

  if (loading) {
    return <p className="text-center mt-5">⏳ Načítám profil...</p>;
  }

  if (error || !profile) {
    return <p className="text-danger text-center mt-5">❌ Profil nelze zobrazit: {error}</p>;
  }

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      {/* Hlavička */}
      <header className="text-center py-3 mb-4" style={{ backgroundColor: "#FFAC76" }}>
        <img src="/images/logo.png" alt="Logo" style={{ width: "70px", height: "70px" }} />
        <h2 className="mt-2 text-dark" style={{ fontFamily: "SuperLarky, 'Segoe UI', sans-serif" }}>
          MicroMatch
        </h2>
      </header>

      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-sm p-4" style={{ backgroundColor: "#FFF3E0" }}>
            <div className="row">
              {/* Levý blok: Fotka + text + tlačítko */}
              <div className="col-md-4 text-center d-flex flex-column align-items-center">
                <h4 className="mb-3">✅  Domluvit spolupráci</h4>
                {profile.photoUrl && (
                  <img
                    src={`http://localhost:5713${profile.photoUrl}`}
                    alt="Profilová fotka"
                    className="img-fluid rounded-circle mb-3"
                    style={{ width: "220px", height: "220px", objectFit: "cover" }}
                  />
                )}
                <button className="btn btn-outline-dark mt-2" onClick={handleStartChat}>
                  💬 Napsat zprávu
                </button>
              </div>

              {/* Pravý blok: Info */}
              <div className="col-md-8">
                <div className="row w-100">
                  <div className="col-sm-6">
                    <p><strong>Jméno:</strong> {profile.name}</p>
                    <p><strong>Lokalita:</strong> {profile.location}</p>
                    <p><strong>Věk:</strong> {profile.age}</p>
                    <p><strong>Pohlaví:</strong> {profile.gender}</p>
                    <p><strong>Zájmy:</strong> {profile.interests}</p>
                    <p><strong>Bio:</strong> {profile.bio}</p>
                  </div>
                  <div className="col-sm-6">
                    <p><strong>Instagram:</strong> {profile.igNickname} ({profile.igFollowers} sledujících)</p>
                    <p><strong>TikTok:</strong> {profile.ttNickname} ({profile.ttFollowers} sledujících)</p>
                    <p><strong>Facebook:</strong> {profile.fbNickname} ({profile.fbFollowers} sledujících)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
}

export default InfluencerDetail;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function InfluencerList() {
  const [influencers, setInfluencers] = useState([]);
  const [remainingContacts, setRemainingContacts] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [contactedOnly, setContactedOnly] = useState(false);
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [searchTerm, contactedOnly, ageGroup, gender, location]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const queryParams = {
        search: searchTerm,
        ageGroup,
        gender,
        location,
        contactedOnly,
      };

      const res = await axios.get("http://localhost:5713/api/influencer/public-list", {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
      });

      setInfluencers(res.data.influencers || []);

      const contactsRes = await axios.get("http://localhost:5713/api/influencer/remaining-contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRemainingContacts(contactsRes.data.remainingContacts);
    } catch (err) {
      console.error("Chyba při načítání dat:", err);
    }
  };

  const handleContact = async (id) => {
    try {
      const res = await axios.post(
        `http://localhost:5713/api/influencer/contact/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.profile) {
        navigate(`/influencer/${id}`);
      }
    } catch (err) {
      console.error("❌ Chyba při kontaktování influencera:", err);
      alert(err?.response?.data?.message || "Nelze kontaktovat influencera.");
    }
  };

  return (
    <div className="container py-4">
      {/* Oranžová hlavička */}
      <section
        style={{ backgroundColor: "#FFAC76" }}
        className="text-center py-3 mb-4 rounded"
      >
        <img src="/images/logo.png" alt="Logo" style={{ height: "60px" }} />
        <h2 className="mt-2 mb-0">Seznam influencerů</h2>
      </section>

      {/* Filtrovací formulář */}
      <div className="card p-4 shadow-sm mb-4" style={{ backgroundColor: "#FFF0E0" }}>
        <div className="row g-3">
          <div className="col-md-4">
            <input
              type="text"
              placeholder="🔍 Hledat zájmy nebo bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-md-2">
            <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="form-select">
              <option value="">Věková skupina</option>
              <option value="15-18">15–18</option>
              <option value="18-25">18–25</option>
              <option value="25-35">25–35</option>
              <option value="35-40">35–40</option>
              <option value="40+">40+</option>
            </select>
          </div>
          <div className="col-md-2">
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="form-select">
              <option value="">Pohlaví</option>
              <option value="male">Muž</option>
              <option value="female">Žena</option>
              <option value="other">Jiné</option>
            </select>
          </div>
          <div className="col-md-2">
            <input
              type="text"
              placeholder="Lokalita"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-md-2 d-flex align-items-center">
            <label className="form-check-label">
              <input
                type="checkbox"
                checked={contactedOnly}
                onChange={() => setContactedOnly(!contactedOnly)}
                className="form-check-input me-2"
              />
              Již kontaktovaní
            </label>
          </div>
        </div>
      </div>

      {/* Zbývající kontakty */}
      {remainingContacts !== null && (
        <p className="mb-3 text-center">
          <strong>Zbývající kontakty:</strong> {remainingContacts}
        </p>
      )}

      {/* Seznam influencerů */}
      {influencers.length === 0 ? (
        <p className="text-center text-muted">Žádní influenceři k zobrazení.</p>
      ) : (
        <div className="row g-4">
          {influencers.map((inf) => (
            <div key={inf._id} className="col-md-6">
              <div className="card shadow-sm p-3 h-100" style={{ backgroundColor: "#FFFDF6" }}>
                <div className="row g-3 align-items-center">
                  <div className="col-md-4 text-center">
                    <img
                      src={`http://localhost:5713${inf.photoUrl}`}
                      alt="Profil"
                      className="img-fluid rounded-circle"
                      style={{ width: "180px", height: "180px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="col-md-8">
                    <p><strong>Lokalita:</strong> {inf.location}</p>
                    <p><strong>Věk:</strong> {inf.age}</p>
                    <p><strong>Pohlaví:</strong> {inf.gender === "male" ? "Muž" : inf.gender === "female" ? "Žena" : "Jiné"}</p>
                    <p><strong>Zájmy:</strong> {inf.interests}</p>
                    <p><strong>Bio:</strong> {inf.bio}</p>
                    <button
                      onClick={() => handleContact(inf._id)}
                      disabled={remainingContacts <= 0 && !contactedOnly}
                      className="btn mt-2 w-100"
                      style={{
                        backgroundColor: remainingContacts <= 0 && !contactedOnly ? "#ccc" : "#FFAC76",
                        color: "#000",
                        fontWeight: "bold",
                        cursor: remainingContacts <= 0 && !contactedOnly ? "not-allowed" : "pointer",
                        opacity: remainingContacts <= 0 && !contactedOnly ? 0.6 : 1,
                      }}
                    >
                      Kontaktovat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InfluencerList;

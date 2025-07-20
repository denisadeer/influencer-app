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
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: queryParams,
      });

      setInfluencers(res.data.influencers || []);

      const contactsRes = await axios.get("http://localhost:5713/api/influencer/remaining-contacts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    <div style={{ padding: "2rem" }}>
      <h2>Seznam influencerů</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Hledat podle zájmů nebo bio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "0.5rem", width: "60%", marginRight: "1rem" }}
        />

        <label>
          <input
            type="checkbox"
            checked={contactedOnly}
            onChange={() => setContactedOnly(!contactedOnly)}
            style={{ marginRight: "0.5rem" }}
          />
          Zobrazit pouze kontaktované
        </label>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
          <option value="">Věková skupina</option>
          <option value="15-18">15–18</option>
          <option value="18-25">18–25</option>
          <option value="25-35">25–35</option>
          <option value="35-40">35–40</option>
          <option value="40+">40+</option>
        </select>

        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Pohlaví</option>
          <option value="male">Muž</option>
          <option value="female">Žena</option>
          <option value="other">Jiné</option>
        </select>

        <input
          type="text"
          placeholder="Lokalita"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {remainingContacts !== null && (
        <p>
          <strong>Zbývající kontakty:</strong> {remainingContacts}
        </p>
      )}

      {remainingContacts === 0 && !contactedOnly && (
        <p style={{ color: "gray", fontStyle: "italic", marginTop: "0.5rem" }}>
          Nemáte žádné volné kontakty pro tento měsíc.
        </p>
      )}

      {influencers.length === 0 ? (
        <p>Žádní influenceři k zobrazení.</p>
      ) : (
        <ul>
          {influencers.map((inf) => (
            <li
              key={inf._id}
              style={{
                marginBottom: "1.5rem",
                borderBottom: "1px solid #ccc",
                paddingBottom: "1rem",
              }}
            >
              <p>
                <strong>Lokalita:</strong> {inf.location}
              </p>
              <p>
                <strong>Věk:</strong> {inf.age}
              </p>
              <p>
                 <strong>Pohlaví:</strong>{" "}
               {inf.gender === "male"
               ? "Muž"
              : inf.gender === "female"
               ? "Žena"
              : inf.gender === "other"
               ? "Jiné"
               : ""}
              </p>
              <p>
                <strong>Zájmy:</strong> {inf.interests}
              </p>
              <p>
                <strong>Bio:</strong> {inf.bio}
              </p>
              {inf.photoUrl && (
                <img
                  src={`http://localhost:5713${inf.photoUrl}`}
                  alt="Profil"
                  style={{ maxWidth: 150 }}
                />
              )}

              <button
                onClick={() => handleContact(inf._id)}
                disabled={remainingContacts <= 0 && !contactedOnly}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor:
                    remainingContacts <= 0 && !contactedOnly ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  cursor:
                    remainingContacts <= 0 && !contactedOnly ? "not-allowed" : "pointer",
                  opacity: remainingContacts <= 0 && !contactedOnly ? 0.6 : 1,
                }}
              >
                Kontaktovat
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default InfluencerList;



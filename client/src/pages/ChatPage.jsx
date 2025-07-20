import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Chat from "../components/Chat";
import { jwtDecode } from "jwt-decode"; // ✅ správný způsob importu

const ChatPage = () => {
  const { influencerId } = useParams();
  const [senderId, setSenderId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token); // ✅ funguje s pojmenovaným importem
        setSenderId(decoded.userId);
        console.log("✅ senderId z JWT:", decoded.userId);
      } catch (err) {
        console.error("❌ Chyba při dekódování tokenu:", err);
      }
    }

    console.log("📨 receiverId (influencerId):", influencerId);
  }, [influencerId]);

  if (!senderId) {
    return <p>❌ Nejste přihlášen/a nebo je neplatný token.</p>;
  }

  if (!influencerId) {
    return <p>❌ Není specifikován příjemce chatu.</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>💬 Chat s influencerem</h2>
      <Chat senderId={senderId} receiverId={influencerId} />
    </div>
  );
};

export default ChatPage;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Chat from "../components/Chat";
import { jwtDecode } from "jwt-decode";

const ChatPage = () => {
  const { influencerId } = useParams();
  const navigate = useNavigate();
  const [senderId, setSenderId] = useState(null);

  // ✅ Načtení senderId z JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setSenderId(decoded.userId);
        console.log("✅ senderId z JWT:", decoded.userId);
      } catch (err) {
        console.error("❌ Chyba při dekódování tokenu:", err);
      }
    }

    console.log("📨 receiverId (influencerId):", influencerId);
  }, [influencerId]);

  // ✅ Označení zpráv jako přečtených
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!senderId || !influencerId) return;

      try {
        const res = await fetch("http://localhost:5713/api/chat/mark-as-read", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ senderId: influencerId }),
        });

        const result = await res.json();
        console.log("✅ Označeno jako přečtené:", result);

        // ✅ Informuj dashboard, že má refreshnout konverzace
        sessionStorage.setItem("chatUpdated", "true");
      } catch (err) {
        console.error("❌ Chyba při označování jako přečtené:", err);
      }
    };

    markMessagesAsRead();
  }, [senderId, influencerId]);

  // ✅ Informace pro dashboard při odchodu z komponenty (záložní jistota)
  useEffect(() => {
    return () => {
      sessionStorage.setItem("chatUpdated", "true");
    };
  }, []);

  // ✅ Ověření přihlášení a existence ID
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

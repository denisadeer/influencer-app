


import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "../styles/dashboardInfluencer.css";

const Chat = ({ senderId, receiverId, role }) => {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const socketRef = useRef(null);
  const readyToReceive = useRef(false);
  const seenIds = useRef(new Set());
  const navigate = useNavigate();
// 👇 tady přidáš tu proměnnou
  const receiverProfilePath =
    role === "business"
      ? `/influencer/${receiverId}`
      : `/profil-podniku/${receiverId}`;

  // Připojení k socketu
  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = io("http://localhost:5713", { auth: { token } });
    socketRef.current = socket;

    const onReceive = (data) => {
      if (!readyToReceive.current) return;

      const { senderId: fromId, receiverId: toId, message, timestamp } = data;
      const idKey = `${fromId}-${toId}-${timestamp}`;
      if (seenIds.current.has(idKey)) return; // deduplikace
      seenIds.current.add(idKey);

      // Bereme jen zprávy mezi těmito dvěma uživateli
      if (
        (fromId === receiverId && toId === senderId) ||
        (fromId === senderId && toId === receiverId)
      ) {
        setChatLog((prev) => [
          ...prev,
          {
            from: fromId === senderId ? "me" : "other",
            text: message,
            timestamp,
          },
        ]);
      }
    };

    socket.on("receive_message", onReceive);

    return () => {
      socket.off("receive_message", onReceive);
      socket.disconnect();
    };
  }, [senderId, receiverId]);

  // Načtení historie + označení jako přečtené
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5713/api/chat/${senderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        const filtered = data.filter((msg) => {
          const sId = msg.senderId?._id || msg.senderId;
          const rId = msg.receiverId?._id || msg.receiverId;
          return (
            (sId === senderId && rId === receiverId) ||
            (sId === receiverId && rId === senderId)
          );
        });

        const formatted = filtered.map((msg) => {
          const sId = msg.senderId?._id || msg.senderId;
          const rId = msg.receiverId?._id || msg.receiverId;
          const idKey = `${sId}-${rId}-${msg.timestamp}`;
          seenIds.current.add(idKey); // označíme už při načtení
          return {
            from: sId === senderId ? "me" : "other",
            text: msg.message,
            timestamp: msg.timestamp,
          };
        });

        setChatLog(formatted);
        readyToReceive.current = true;

        // Označit zprávy jako přečtené
        await fetch("http://localhost:5713/api/chat/mark-as-read", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ senderId: receiverId }),
        });
      } catch (err) {
        console.error("❌ Chyba při načítání zpráv nebo označení jako přečtené:", err);
      }
    };

    fetchMessages();
  }, [senderId, receiverId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const timestamp = new Date().toISOString();
    const messageData = { receiverId, message, timestamp };

    // Odešleme na server – NEpřidáváme lokálně do chatLog (jinak by to bylo 2×)
    socketRef.current?.emit("send_message", messageData);
    setMessage("");
  };

  return (
    <div className="container-fluid bg-light min-vh-100">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          {/* Hlavička ve stejném stylu */}
          <header className="text-center py-3 mb-4">
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "22px",
                padding: "12px 22px",
                display: "inline-block",
                border: "1px solid rgb(197, 197, 197)",
                boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
              }}
            >
              <img
                src="/images/logo.png"
                alt="Logo"
                style={{ width: "70px", height: "70px" }}
              />
              <h2 className="mt-2 text-dark" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
                MicroMatch
              </h2>
            </div>
          </header>

          {/* Karta chatu v meruňkovém sidebar stylu */}
          <div className="set-custom-side-bar p-3" style={{ borderRadius: 10 }}>
            {/* Horní lišta */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">💬 Chat</h5>
              <button
                type="button"
                className="set-btn-white-custom"
                onClick={() => navigate(receiverProfilePath)}
>
  🔍 Profil podniku
</button>
            </div>

            {/* Okno konverzace */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #eaeaea",
                borderRadius: 12,
                height: 360,
                overflowY: "auto",
                padding: "12px",
              }}
            >
              {chatLog.length === 0 ? (
                <p className="text-center text-muted mt-3 mb-0">Zatím žádné zprávy</p>
              ) : (
                chatLog.map((msg, idx) => (
                  <div
                    key={msg.timestamp || idx}
                    style={{
                      display: "flex",
                      justifyContent: msg.from === "me" ? "flex-end" : "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "75%",
                        padding: "8px 12px",
                        borderRadius: 12,
                        boxShadow: "rgba(149,157,165,0.2) 0px 8px 24px",
                        backgroundColor: msg.from === "me" ? "#ffefe0" : "#ffffff",
                        border: "1px solid #fed9ca",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          opacity: 0.7,
                          marginBottom: 4,
                          textAlign: msg.from === "me" ? "right" : "left",
                        }}
                      >
                        {msg.from === "me" ? "🧍 Ty" : "👤 Druhá strana"}
                      </div>
                      <div>{msg.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Vstup a odeslání */}
            <div className="row mt-3">
              <div className="col-9 set--input-all">
                <label>Zpráva</label>
                <input
                  type="text"
                  placeholder="Napiš zprávu…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-control"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>
              <div className="col-3 d-flex align-items-end">
                <button
                  onClick={sendMessage}
                  className="set-btn-custom w-100"
                  type="button"
                >
                  ✉️ Odeslat
                </button>
              </div>
            </div>
          </div>

          {/* Zpět na dashboard */}
          <div className="text-center mt-3">
            <button
              type="button"
              className="set-btn-white-custom"
              onClick={() => navigate(-1)}
            >
              ← Zpět
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

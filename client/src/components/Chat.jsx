import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const Chat = ({ senderId, receiverId }) => {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const socketRef = useRef(null);
  const readyToReceive = useRef(false);
  const seenIds = useRef(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");

    const socket = io("http://localhost:5713", {
      auth: { token },
    });

    socketRef.current = socket;
    console.log("✅ Socket připojen");

    socket.on("receive_message", (data) => {
      if (!readyToReceive.current) return;

      const { senderId: fromId, receiverId: toId, message, timestamp } = data;
      const idKey = `${fromId}-${toId}-${timestamp}`;

      if (seenIds.current.has(idKey)) return;
      seenIds.current.add(idKey);

      if (
        (fromId === receiverId && toId === senderId) ||
        (fromId === senderId && toId === receiverId)
      ) {
        setChatLog((prev) => [
          ...prev,
          {
            from: fromId === senderId ? "🧍 Ty" : "👤 Jiný",
            text: message,
            timestamp,
          },
        ]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [senderId, receiverId]);

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
          seenIds.current.add(idKey);

          return {
            from: sId === senderId ? "🧍 Ty" : "👤 Jiný",
            text: msg.message,
            timestamp: msg.timestamp,
          };
        });

        setChatLog(formatted);
        readyToReceive.current = true;

        // 👇 PATCH: Označit zprávy jako přečtené
        await fetch("http://localhost:5713/api/chat/mark-as-read", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ senderId: receiverId }),
        });
        console.log("✅ Zprávy označeny jako přečtené");
      } catch (err) {
        console.error("❌ Chyba při načítání zpráv nebo označení jako přečtené:", err);
      }
    };

    fetchMessages();
  }, [senderId, receiverId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const timestamp = new Date().toISOString();
    const messageData = {
      receiverId,
      message,
      timestamp,
    };

    socketRef.current?.emit("send_message", messageData);
    setMessage("");
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "400px" }}>
  <h2>💬 Chat</h2>

  {/* ✅ Odkaz na profil podniku */}
  <div style={{ marginBottom: "1rem" }}>
    <a
      href={`/profil-podniku/${receiverId}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "underline", color: "blue" }}
    >
      🔍 Zobrazit profil podniku
    </a>
  </div>

  <div
    style={{
      border: "1px solid #ccc",
      height: "200px",
      overflowY: "scroll",
      padding: "0.5rem",
      marginBottom: "1rem",
    }}
  >
    {chatLog.map((msg, index) => (
      <div key={msg.timestamp || index}>
        <strong>{msg.from}:</strong> {msg.text}
      </div>
    ))}
  </div>

  <input
    type="text"
    placeholder="Napiš zprávu"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    style={{ width: "100%", marginBottom: "0.5rem" }}
  />
  <button onClick={sendMessage}>Odeslat</button>
</div>

  );
};

export default Chat;

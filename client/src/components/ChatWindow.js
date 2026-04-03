import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

export default function ChatWindow({ user, selectedUser }) {
  const [socket, setSocket] = useState(null);
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [typing, setTyping] = useState("");

  const messagesEndRef = useRef(null);

  // 🔌 SOCKET CONNECTION
  useEffect(() => {
    const s = io("http://localhost:5000", {
      auth: { token: user.token },
    });

    s.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    s.on("typing", (data) => {
      if (selectedUser && data.from === selectedUser._id) {
        setTyping("Typing...");
        setTimeout(() => setTyping(""), 1000);
      }
    });

    setSocket(s);

    return () => s.disconnect();
  }, [user, selectedUser]);

  // 📜 LOAD CHAT HISTORY
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        setChat([]);

        const res = await axios.get(
          `http://localhost:5000/api/messages/${user.userId}/${selectedUser._id}`
        );

        setChat(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchMessages();
  }, [selectedUser, user.userId]);

  // 🔄 AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // 📤 SEND MESSAGE
  const sendMessage = () => {
    if (!socket || !selectedUser || !msg.trim()) return;

    socket.emit("send_message", {
      toUserId: selectedUser._id,
      message: msg,
    });

    setMsg("");

    // 🔥 RESET TEXTAREA HEIGHT
    const textarea = document.querySelector(".inputBox textarea");
    if (textarea) textarea.style.height = "20px";
  };

  // 🕒 FORMAT TIME
  const formatTime = (time) => {
    if (!time) return "";

    const date = new Date(time);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chat">

      {/* 🧠 HEADER */}
      <div className="chat-header">
        {selectedUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={`https://ui-avatars.com/api/?name=${selectedUser.username}&background=00a884&color=fff`}
              alt="avatar"
              className="avatar"
            />
            <span>{selectedUser.username}</span>
          </div>
        ) : (
          "Select a chat"
        )}
      </div>

      {/* 💬 MESSAGES */}
      <div className="messages">
        {chat.map((c, i) => (
          <div
            key={i}
            className={`message ${
              c.sender === user.userId ? "sent" : "received"
            }`}
          >
            <div>{c.message}</div>
            <div className="time">{formatTime(c.timestamp)}</div>
          </div>
        ))}

        <div ref={messagesEndRef}></div>
      </div>

      {/* ✍️ TYPING */}
      <div className="typing">{typing}</div>

      {/* ⌨️ INPUT */}
      {/* ⌨️ INPUT */}
<div className="inputBox">
  <div className="input-inner">
    <textarea
      value={msg}
      onChange={(e) => {
        setMsg(e.target.value);

        const el = e.target;
        el.style.height = "20px";
        el.style.height = Math.min(el.scrollHeight, 80) + "px";

        if (socket && selectedUser) {
          socket.emit("typing", {
            toUserId: selectedUser._id,
          });
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      }}
      placeholder="Type a message"
    />

    <button onClick={sendMessage}>➤</button>
  </div>
</div>

    </div>
  );
}
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Sidebar({ setToUser, user, setUser }) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) return; // 🔥 prevent error after logout

    const socket = io("http://localhost:5000", {
      auth: { token: user.token },
    });

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    return () => socket.disconnect();
  }, [user]);

  // 🔥 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
  };

  return (
    <div className="sidebar">

      {/* ✅ CLEAN HEADER */}
      <div className="sidebar-header">
        <h2 className="sidebar-logo">💬 Chattrix</h2>
      </div>

      {/* USERS */}
      <div className="users-list">
        {onlineUsers
          .filter((u) => u._id !== user?.userId)
          .map((u) => (
            <div
              key={u._id}
              className="user"
              onClick={() => setToUser(u)}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${u.username}&background=00a884&color=fff`}
                alt="avatar"
                className="avatar"
              />
              <span>{u.username}</span>
            </div>
          ))}
      </div>

      {/* 🔥 LOGOUT AT BOTTOM */}
      <div className="logout-container">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

    </div>
  );
}
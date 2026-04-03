import { useState } from "react";
import Login from "./Login";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    return token && userId ? { token, userId } : null;
  });

  const [selectedUser, setSelectedUser] = useState(null);

  // 🔥 VERY IMPORTANT: STOP EVERYTHING IF USER IS NULL
  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <div className="app">
      <Sidebar
        setToUser={setSelectedUser}
        user={user}
        setUser={setUser}
      />
      <ChatWindow
        user={user}
        selectedUser={selectedUser}
      />
    </div>
  );
}

export default App;
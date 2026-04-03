import { useState } from "react";
import axios from "axios";

export default function Login({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      const url = isLogin
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/signup";

      const payload = isLogin
        ? { email, password }
        : { username, email, password };

      const res = await axios.post(url, payload);

      const { token, userId } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);

      setUser({ token, userId });

    } catch (err) {
      alert(isLogin ? "Login failed" : "Signup failed");
    }
  };

  return (
    <div className="login-container">
      <h1 className="logo">💬 Chattrix</h1>

      <div className="login-box">
        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>

        {/* 👤 Username only for signup */}
        {!isLogin && (
          <input
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleSubmit}>
          {isLogin ? "Login" : "Signup"}
        </button>

        {/* 🔄 TOGGLE */}
        <p
          style={{ color: "#aaa", marginTop: "10px", cursor: "pointer" }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Signup"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}
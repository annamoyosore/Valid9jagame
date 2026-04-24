import { useState } from "react";
import { account, ID } from "../lib/appwrite";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);

  // =========================
  // 🎮 START BUTTON
  // =========================
  function handleStart() {
    console.log("Start Playing clicked");

    setStartLoading(true);

    // simulate slight delay for smooth UX
    setTimeout(() => {
      setShowLogin(true);
      setStartLoading(false);
    }, 500);
  }

  // =========================
  // 🔐 HANDLE LOGIN
  // =========================
  async function handleLogin() {
    if (!email) {
      return setMessage("❌ Enter email");
    }

    setLoading(true);
    setMessage("");

    try {
      await account.createMagicURLToken(
        ID.unique(),
        email,
        window.location.origin + "/dashboard"
      );

      setMessage("✅ Check your email for login link");
    } catch (err) {
      console.error("Login error:", err);
      setMessage("❌ Failed to send email");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "#fff",
        textAlign: "center",
        padding: 20
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: 10 }}>
        🎮 WHOT Multiplayer Game
      </h1>

      <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>
        Play • Compete • Win Coins 🪙
      </p>

      {/* =========================
          🔘 START BUTTON
      ========================= */}
      {!showLogin && (
        <button
          onClick={handleStart}
          disabled={startLoading}
          style={{
            marginTop: 30,
            padding: "12px 24px",
            background: startLoading ? "#999" : "#22c55e",
            color: "#000",
            borderRadius: 8,
            border: "none",
            fontWeight: "bold",
            cursor: startLoading ? "not-allowed" : "pointer"
          }}
        >
          {startLoading ? "Loading..." : "Start Playing"}
        </button>
      )}

      {/* =========================
          🔐 LOGIN FORM
      ========================= */}
      {showLogin && (
        <div style={{ marginTop: 30 }}>
          <h2>Continue with Email</h2>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: 10,
              width: 250,
              borderRadius: 6,
              border: "none"
            }}
          />

          <br /><br />

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              padding: 10,
              borderRadius: 6,
              border: "none",
              background: loading ? "#999" : "#22c55e",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Sending..." : "Send Login Link"}
          </button>

          <p style={{ marginTop: 10 }}>{message}</p>

          {/* 🔙 BACK BUTTON */}
          <button
            onClick={() => setShowLogin(false)}
            style={{
              marginTop: 10,
              padding: 6,
              background: "transparent",
              border: "none",
              color: "#ccc",
              cursor: "pointer"
            }}
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
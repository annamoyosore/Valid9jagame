import { useState } from "react";
import { account } from "../lib/appwrite";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    if (!email) return setMessage("❌ Enter email");

    try {
      await account.createMagicURLToken(
        "unique()",
        email,
        window.location.origin + "/dashboard"
      );

      setMessage("✅ Check your email for login link");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to send email");
    }
  }

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
          onClick={() => setShowLogin(true)}
          style={{
            marginTop: 30,
            padding: "12px 24px",
            background: "#22c55e",
            color: "#000",
            borderRadius: 8,
            border: "none",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Start Playing
        </button>
      )}

      {/* =========================
          🔐 LOGIN FORM (INLINE)
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
            style={{
              padding: 10,
              borderRadius: 6,
              border: "none",
              background: "#22c55e",
              cursor: "pointer"
            }}
          >
            Send Login Link
          </button>

          <p style={{ marginTop: 10 }}>{message}</p>
        </div>
      )}
    </div>
  );
}
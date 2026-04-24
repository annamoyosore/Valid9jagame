import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleStart() {
    setLoading(true);

    // small delay for UX feel
    setTimeout(() => {
      navigate("/login"); // ✅ correct lowercase route
    }, 700);
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
        🎮 WHOT Multiplayer
      </h1>

      <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>
        Play • Compete • Win Coins 🪙
      </p>

      <div style={{ marginTop: 30, display: "flex", gap: 10 }}>
        
        {/* ✅ START BUTTON WITH LOADING */}
        {loading ? (
          <div style={{ fontSize: "1.1rem" }}>
            ⏳ Loading...
          </div>
        ) : (
          <button
            onClick={handleStart}
            style={{
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

        {/* ✅ DASHBOARD LINK */}
        <Link
          to="/dashboard"
          style={{
            padding: "12px 24px",
            border: "1px solid #fff",
            borderRadius: 8,
            textDecoration: "none",
            color: "#fff",
            display: "inline-block"
          }}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
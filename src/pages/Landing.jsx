import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  function handleStart() {
    console.log("Start button clicked");

    // ✅ Try SPA navigation first
    navigate("/login", { replace: true });

    // 🔁 Fallback (in case React Router fails)
    setTimeout(() => {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }, 200);
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

      <button
        onClick={handleStart}
        style={{
          marginTop: 30,
          padding: "14px 28px",
          background: "#22c55e",
          color: "#000",
          border: "none",
          borderRadius: 8,
          fontSize: "1rem",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Start Playing
      </button>
    </div>
  );
}
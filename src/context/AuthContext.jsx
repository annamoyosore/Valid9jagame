import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  function goToLogin() {
    console.log("Start Playing clicked");

    try {
      // ✅ Primary navigation (SPA)
      navigate("/login", { replace: true });

      // 🔁 Fallback (in case React Router fails silently)
      setTimeout(() => {
        if (window.location.pathname !== "/login") {
          console.log("Fallback triggered");
          window.location.href = "/login";
        }
      }, 300);

    } catch (err) {
      console.error("Navigation failed:", err);
      window.location.href = "/login"; // 🔥 hard fallback
    }
  }

  function goToDashboard() {
    navigate("/dashboard", { replace: true });
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

      <div style={{ marginTop: 30, display: "flex", gap: 10 }}>
        
        {/* ✅ FIXED BUTTON */}
        <button
          onClick={goToLogin}
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

        {/* Dashboard */}
        <button
          onClick={goToDashboard}
          style={{
            padding: "12px 24px",
            border: "1px solid #fff",
            borderRadius: 8,
            background: "transparent",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}
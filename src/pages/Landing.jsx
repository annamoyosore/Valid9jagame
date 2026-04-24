export default function Landing() {
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

      <div style={{ marginTop: 30 }}>
        <a
          href="/login"
          style={{
            padding: "12px 24px",
            background: "#22c55e",
            color: "#000",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: "bold",
            marginRight: 10
          }}
        >
          Start Playing
        </a>

        <a
          href="/dashboard"
          style={{
            padding: "12px 24px",
            border: "1px solid #fff",
            borderRadius: 8,
            textDecoration: "none",
            color: "#fff"
          }}
        >
          Dashboard
        </a>
      </div>
    </div>
  );
}
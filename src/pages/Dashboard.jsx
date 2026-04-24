import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div
      style={{
        padding: 30,
        maxWidth: 600,
        margin: "auto",
        textAlign: "center"
      }}
    >
      <h2>📊 Dashboard</h2>

      <p style={{ marginTop: 10 }}>
        Welcome, <strong>{user?.email || "Player"}</strong> 👋
      </p>

      <div style={{ marginTop: 30 }}>
        <Link
          to="/wallet"
          style={{
            display: "block",
            padding: 12,
            marginBottom: 10,
            background: "#22c55e",
            color: "#000",
            borderRadius: 6,
            textDecoration: "none"
          }}
        >
          💰 Wallet
        </Link>

        <Link
          to="/gameroom"
          style={{
            display: "block",
            padding: 12,
            background: "#3b82f6",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none"
          }}
        >
          🎮 Enter Game Room
        </Link>
      </div>
    </div>
  );
}
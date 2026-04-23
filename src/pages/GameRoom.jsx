import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getWallet, lockCoins } from "../utils/wallet";
import { findOrCreateGame } from "../utils/game";
import { useNavigate } from "react-router-dom";

export default function GameRoom() {
  const { user } = useAuth();
  const [stake, setStake] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function startMatch() {
    if (!stake) return alert("Enter stake");

    setLoading(true);

    try {
      const wallet = await getWallet(user.$id);

      // 🔒 lock coins
      await lockCoins(wallet, Number(stake));

      // 🎮 matchmaking
      const game = await findOrCreateGame(user.$id, Number(stake));

      if (game.status === "waiting") {
        alert("⏳ Waiting for opponent...");
      } else {
        navigate(`/game/${game.$id}`);
      }

    } catch (err) {
      alert("❌ " + err);
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>🎮 Game Room</h1>

      <p>Enter stake to play</p>

      <input
        type="number"
        placeholder="Stake amount"
        value={stake}
        onChange={(e) => setStake(e.target.value)}
        style={{
          padding: 10,
          width: 200,
          borderRadius: 6,
          border: "none"
        }}
      />

      <br /><br />

      <button
        onClick={startMatch}
        disabled={loading}
        style={{
          padding: 12,
          background: "gold",
          border: "none",
          borderRadius: 8,
          fontWeight: "bold"
        }}
      >
        {loading ? "Matching..." : "Play"}
      </button>
    </div>
  );
}
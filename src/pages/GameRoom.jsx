import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getWallet, lockCoins } from "../utils/wallet";
import { findOrCreateGame } from "../utils/game";
import {
  realtime,
  DB_ID,
  GAMES_COLLECTION_ID
} from "../lib/appwrite";
import { useNavigate } from "react-router-dom";

export default function GameRoom() {
  const { user } = useAuth();
  const [stake, setStake] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingGame, setWaitingGame] = useState(null);
  const navigate = useNavigate();

  // ⚡ REALTIME LISTENER
  useEffect(() => {
    if (!waitingGame) return;

    const unsubscribe = realtime.subscribe(
      `databases.${DB_ID}.collections.${GAMES_COLLECTION_ID}.documents`,
      (res) => {
        const updated = res.payload;

        if (
          updated.$id === waitingGame.$id &&
          updated.status === "playing"
        ) {
          navigate(`/game/${updated.$id}`);
        }
      }
    );

    return () => unsubscribe();
  }, [waitingGame]);

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
        setWaitingGame(game);
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

      <input
        type="number"
        placeholder="Stake amount"
        value={stake}
        onChange={(e) => setStake(e.target.value)}
        style={{ padding: 10 }}
      />

      <br /><br />

      <button onClick={startMatch} disabled={loading}>
        {loading ? "Matching..." : "Play"}
      </button>

      {waitingGame && (
        <p style={{ marginTop: 20 }}>
          ⏳ Waiting for opponent...
        </p>
      )}
    </div>
  );
}
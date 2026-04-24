import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  databases,
  realtime,
  DB_ID,
  GAMES_COLLECTION_ID
} from "../lib/appwrite";
import { useAuth } from "../context/AuthContext";

export default function Game() {
  const { id } = useParams();
  const { user } = useAuth();
  const [game, setGame] = useState(null);

  useEffect(() => {
    loadGame();

    const unsub = realtime.subscribe(
      `databases.${DB_ID}.collections.${GAMES_COLLECTION_ID}.documents.${id}`,
      (res) => {
        setGame(res.payload);
      }
    );

    return () => unsub();
  }, []);

  async function loadGame() {
    const g = await databases.getDocument(DB_ID, GAMES_COLLECTION_ID, id);
    setGame(g);
  }

  if (!game) return <p>Loading...</p>;

  const state = JSON.parse(game.state || "{}");

  const myHand = state.players?.[user.$id] || [];

  return (
    <div style={{ padding: 20 }}>
      <h2>🎮 Multiplayer WHOT</h2>

      <p>Turn: {state.turn === user.$id ? "YOU" : "OPPONENT"}</p>

      <div>
        {myHand.map((c, i) => (
          <button key={i}>{c.number}</button>
        ))}
      </div>
    </div>
  );
}
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

  // 🔄 LOAD + REALTIME SYNC
  useEffect(() => {
    loadGame();

    const unsubscribe = realtime.subscribe(
      `databases.${DB_ID}.collections.${GAMES_COLLECTION_ID}.documents.${id}`,
      (res) => {
        setGame(res.payload);
      }
    );

    return () => unsubscribe();
  }, []);

  async function loadGame() {
    const g = await databases.getDocument(DB_ID, GAMES_COLLECTION_ID, id);
    setGame(g);
  }

  if (!game) return <p>Loading game...</p>;

  const state = JSON.parse(game.state || "{}");

  const myHand = state.players?.[user.$id] || [];

  // 🎮 PLAY CARD (STEP 6 CORE LOGIC)
  async function playCard(index) {
    if (state.turn !== user.$id) return alert("Not your turn");

    const newState = JSON.parse(JSON.stringify(state));

    const card = newState.players[user.$id][index];

    // remove card
    newState.players[user.$id].splice(index, 1);

    // add to discard
    newState.discard.push(card);

    // switch turn
    const opponent = game.players.find(p => p !== user.$id);
    newState.turn = opponent;

    await databases.updateDocument(
      DB_ID,
      GAMES_COLLECTION_ID,
      id,
      {
        state: JSON.stringify(newState),
        lastMove: Date.now().toString()
      }
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🎮 Multiplayer WHOT</h2>

      <p>
        Turn:{" "}
        {state.turn === user.$id ? "🟢 YOUR TURN" : "🔴 OPPONENT"}
      </p>

      <hr />

      {/* 🃏 TOP CARD */}
      <div>
        <h3>Top Card</h3>
        {state.discard?.length > 0 && (
          <p>
            {state.discard[state.discard.length - 1].shape} -{" "}
            {state.discard[state.discard.length - 1].number}
          </p>
        )}
      </div>

      <hr />

      {/* 🖐️ PLAYER HAND */}
      <div>
        <h3>Your Cards</h3>

        {myHand.length === 0 && <p>No cards</p>}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {myHand.map((c, i) => (
            <button
              key={i}
              onClick={() => playCard(i)}
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                background:
                  state.turn === user.$id ? "#fff" : "#999",
                cursor:
                  state.turn === user.$id
                    ? "pointer"
                    : "not-allowed"
              }}
            >
              {c.shape} {c.number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
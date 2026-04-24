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
  // =========================
  // 🔹 ROUTER + AUTH
  // =========================
  const { id } = useParams();
  const { user } = useAuth();

  // =========================
  // 🔹 STATE
  // =========================
  const [game, setGame] = useState(null);

  // =========================
  // 🔹 LOAD GAME + REALTIME SYNC
  // =========================
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

  // =========================
  // 🔹 LOADING STATE
  // =========================
  if (!game) return <p>Loading game...</p>;

  // =========================
  // 🔹 PARSE GAME STATE
  // =========================
  const state = JSON.parse(game.state || "{}");

  const myHand = state.players?.[user.$id] || [];

  // =========================
  // 🎮 PLAY CARD (CORE LOGIC)
  // =========================
  async function playCard(index) {
    if (state.turn !== user.$id) return alert("Not your turn");

    const newState = JSON.parse(JSON.stringify(state));

    const card = newState.players[user.$id][index];

    // remove card
    newState.players[user.$id].splice(index, 1);

    // add to discard
    newState.discard.push(card);

    // 🔁 SWITCH TURN
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

  // =========================
  // 🎯 FUTURE: VALIDATION LOGIC
  // =========================
  // TODO:
  // - Check valid move
  // - Apply WHOT rules (2, 8, 14)
  // - Handle draw logic

  // =========================
  // 🏆 FUTURE: WIN DETECTION
  // =========================
  // TODO:
  // - Detect empty hand
  // - Trigger winner
  // - Move to next round

  // =========================
  // 🔁 FUTURE: ROUND SYSTEM
  // =========================
  // TODO:
  // - Track rounds (1 → 3)
  // - Reset state between rounds

  // =========================
  // 💰 FUTURE: PAYOUT SYSTEM
  // =========================
  // TODO:
  // - Deduct 10% fee
  // - Reward winner
  // - Handle penalties

  // =========================
  // 🎨 UI RENDER
  // =========================
  return (
    <div style={{ padding: 20 }}>
      
      {/* =========================
          🔹 HEADER
      ========================= */}
      <h2>🎮 Multiplayer WHOT</h2>

      <p>
        Turn:{" "}
        {state.turn === user.$id ? "🟢 YOUR TURN" : "🔴 OPPONENT"}
      </p>

      <hr />

      {/* =========================
          🃏 TOP CARD SECTION
      ========================= */}
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

      {/* =========================
          🖐️ PLAYER HAND SECTION
      ========================= */}
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

      {/* =========================
          🤖 FUTURE: OPPONENT VIEW
      ========================= */}
      {/* TODO:
          - Show opponent card count
          - Hide opponent cards
      */}

      {/* =========================
          📊 FUTURE: GAME INFO PANEL
      ========================= */}
      {/* TODO:
          - Show stake
          - Show pot
          - Show round number
      */}

    </div>
  );
}
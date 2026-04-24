import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  databases,
  realtime,
  DB_ID,
  GAMES_COLLECTION_ID
} from "../lib/appwrite";
import { useAuth } from "../context/AuthContext";
import { getWallet, rewardWinner } from "../utils/wallet";

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
  // 🔹 LOAD + REALTIME
  // =========================
  useEffect(() => {
    loadGame();

    const unsubscribe = realtime.subscribe(
      `databases.${DB_ID}.collections.${GAMES_COLLECTION_ID}.documents.${id}`,
      (res) => setGame(res.payload)
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

  const opponent = game.players.find(p => p !== user.$id);

  // =========================
  // 🎮 PLAY CARD + WHOT RULES
  // =========================
  async function playCard(index) {
    if (state.turn !== user.$id) return alert("Not your turn");

    const newState = JSON.parse(JSON.stringify(state));
    const card = newState.players[user.$id][index];

    // remove card
    newState.players[user.$id].splice(index, 1);
    newState.discard.push(card);

    // =========================
    // 🧠 WHOT RULES
    // =========================

    // 🔴 2 → PICK 2
    if (card.number === 2) {
      newState.players[opponent].push(newState.deck.pop());
      newState.players[opponent].push(newState.deck.pop());
      newState.turn = user.$id; // you play again
    }

    // 🔵 8 → SUSPEND
    else if (card.number === 8) {
      newState.turn = user.$id; // skip opponent
    }

    // 🟢 14 → GENERAL MARKET (Pick 1 + Skip)
    else if (card.number === 14) {
      newState.players[opponent].push(newState.deck.pop());
      newState.turn = user.$id;
    }

    // 🟡 1 → HOLD ON (Play Again)
    else if (card.number === 1) {
      newState.turn = user.$id;
    }

    // ⚪ NORMAL CARD
    else {
      newState.turn = opponent;
    }

    // =========================
    // 🏆 CHECK WINNER
    // =========================
    await checkWinner(newState);

    // =========================
    // 💾 SAVE STATE
    // =========================
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
  // 🏆 WINNER DETECTION
  // =========================
  async function checkWinner(newState) {
    const me = user.$id;

    if (newState.players[me].length === 0) {
      await finishGame(me);
    }

    if (newState.players[opponent].length === 0) {
      await finishGame(opponent);
    }
  }

  // =========================
  // 💰 FINAL PAYOUT
  // =========================
  async function finishGame(winnerId) {
    const pot = game.pot || 0;

    const fee = Math.floor(pot * 0.1);
    const reward = pot - fee;

    const wallet = await getWallet(winnerId);
    await rewardWinner(wallet, reward);

    await databases.updateDocument(
      DB_ID,
      GAMES_COLLECTION_ID,
      id,
      {
        finished: true,
        winner: winnerId
      }
    );
  }

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div style={{ padding: 20 }}>
   <h2>🎮 Multiplayer WHOT</h2>

<p>
  Turn:{" "}
  {state.turn === user.$id ? "🟢 YOUR TURN" : "🔴 OPPONENT"}
</p>

{/* =========================
    📊 GAME INFO (NEW)
========================= */}
<div style={{ marginBottom: 10 }}>
  <strong>Round:</strong> {game.round || 1} / 3  
  &nbsp; | &nbsp;  
  <strong>Pot:</strong> {game.pot || 0} 🪙
</div>

<hr />

{/* 🃏 TOP CARD */}
<div>
  <h3>Top Card</h3>
  {state.discard?.length > 0 && (
    <p>
      {state.discard.at(-1).shape} - {state.discard.at(-1).number}
    </p>
  )}
</div>

<hr />

{/* 🖐️ YOUR HAND */}
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
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
  const { id } = useParams();
  const { user } = useAuth();

  const [game, setGame] = useState(null);
  const [message, setMessage] = useState("");

  // =========================
  // 🔄 LOAD + REALTIME
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
  const topCard = state.discard?.at(-1);

  // =========================
  // ♻️ DECK RESHUFFLE
  // =========================
  function reshuffleDeck(newState) {
    if (newState.deck.length === 0) {
      const discard = [...newState.discard];
      const top = discard.pop();

      newState.deck = discard.sort(() => Math.random() - 0.5);
      newState.discard = [top];
    }
  }

  // =========================
  // 🎯 VALIDATION
  // =========================
  function isValidMove(card, topCard) {
    if (!topCard) return { valid: true };

    if (card.number === topCard.number) return { valid: true };
    if (card.shape === topCard.shape) return { valid: true };

    return {
      valid: false,
      reason: "Match number or shape"
    };
  }

  function hasValidMove(hand, topCard) {
    return hand.some(
      c => c.number === topCard?.number || c.shape === topCard?.shape
    );
  }

  // =========================
  // 🎮 PLAY CARD
  // =========================
  async function playCard(index) {
    if (state.turn !== user.$id) {
      return setMessage("⛔ Not your turn");
    }

    const newState = JSON.parse(JSON.stringify(state));
    const card = newState.players[user.$id][index];

    const check = isValidMove(card, topCard);

    if (!check.valid) {
      return setMessage(`❌ ${check.reason}`);
    }

    newState.players[user.$id].splice(index, 1);
    newState.discard.push(card);

    reshuffleDeck(newState);

    // =========================
    // 🧠 WHOT RULES
    // =========================
    if (card.number === 2) {
      reshuffleDeck(newState);
      newState.players[opponent].push(newState.deck.pop());
      newState.players[opponent].push(newState.deck.pop());
      newState.turn = user.$id;
      setMessage("🔴 Pick 2!");
    }

    else if (card.number === 8) {
      newState.turn = user.$id;
      setMessage("🔵 Suspend!");
    }

    else if (card.number === 14) {
      reshuffleDeck(newState);
      newState.players[opponent].push(newState.deck.pop());
      newState.turn = user.$id;
      setMessage("🟢 General Market!");
    }

    else if (card.number === 1) {
      newState.turn = user.$id;
      setMessage("🟡 Play again!");
    }

    else {
      newState.turn = opponent;
      setMessage("");
    }

    await checkWinner(newState);

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
  // 🃏 DRAW CARD
  // =========================
  async function drawCard() {
    if (state.turn !== user.$id) {
      return setMessage("⛔ Not your turn");
    }

    const newState = JSON.parse(JSON.stringify(state));

    reshuffleDeck(newState);

    const drawn = newState.deck.pop();

    if (!drawn) {
      return setMessage("No cards left");
    }

    newState.players[user.$id].push(drawn);
    newState.turn = opponent;

    setMessage("🃏 You drew a card");

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
  // 🏆 WIN CHECK
  // =========================
  async function checkWinner(newState) {
    if (newState.players[user.$id].length === 0) {
      await finishGame(user.$id);
    }

    if (newState.players[opponent].length === 0) {
      await finishGame(opponent);
    }
  }

  // =========================
  // 💰 PAYOUT
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
    <div style={{ padding: 20, maxWidth: 500, margin: "auto" }}>
      <h2>🎮 Multiplayer WHOT</h2>

      <p>
        {state.turn === user.$id
          ? "🟢 Your Turn"
          : "🔴 Opponent Turn"}
      </p>

      <div style={{ marginBottom: 10 }}>
        <strong>Round:</strong> {game.round || 1} / 3 |{" "}
        <strong>Pot:</strong> {game.pot || 0} 🪙
      </div>

      {message && (
        <div style={{ color: "yellow", marginBottom: 10 }}>
          {message}
        </div>
      )}

      <hr />

      {/* TOP CARD */}
      <div>
        <h3>Top Card</h3>
        {topCard && (
          <p>
            {topCard.shape} - {topCard.number}
          </p>
        )}
      </div>

      {/* DRAW BUTTON */}
      <button
        onClick={drawCard}
        disabled={state.turn !== user.$id}
        style={{
          marginTop: 10,
          padding: 10,
          background: "gold",
          border: "none",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        🃏 Draw Card
      </button>

      {!hasValidMove(myHand, topCard) && (
        <p style={{ color: "orange" }}>
          ⚠️ No valid move — draw a card
        </p>
      )}

      <hr />

      {/* PLAYER HAND */}
      <div>
        <h3>Your Cards</h3>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {myHand.map((c, i) => (
            <button
              key={i}
              onClick={() => playCard(i)}
              disabled={state.turn !== user.$id}
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                background:
                  state.turn === user.$id ? "#fff" : "#555",
                color:
                  state.turn === user.$id ? "#000" : "#ccc"
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
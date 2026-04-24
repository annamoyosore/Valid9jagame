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

const SHAPES = ["circle", "triangle", "square", "star", "cross"];

function generateDeck() {
  const deck = [];

  for (const shape of SHAPES) {
    for (let i = 1; i <= 13; i++) {
      if (i === 6 || i === 9) continue;
      deck.push({ shape, number: i });
    }
    deck.push({ shape, number: 14 });
  }

  return deck.sort(() => Math.random() - 0.5);
}

export default function Game() {
  const { id } = useParams();
  const { user } = useAuth();

  const [game, setGame] = useState(null);
  const [message, setMessage] = useState("");

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
  // 🔒 SAFE DRAW
  // =========================
  function safeDraw(newState) {
    if (newState.deck.length === 0) {
      const discard = [...newState.discard];
      const top = discard.pop();

      newState.deck = discard.sort(() => Math.random() - 0.5);
      newState.discard = [top];
    }

    return newState.deck.pop();
  }

  // =========================
  // 🎯 VALIDATION
  // =========================
  function isValidMove(card, topCard) {
    if (!topCard) return true;
    return (
      card.number === topCard.number ||
      card.shape === topCard.shape
    );
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
    if (game.finished) return setMessage("Game finished");
    if (state.turn !== user.$id) return setMessage("⛔ Not your turn");

    const fresh = await databases.getDocument(DB_ID, GAMES_COLLECTION_ID, id);
    if (fresh.lastMove !== game.lastMove) {
      return setMessage("⚠️ Sync issue, retry");
    }

    const newState = JSON.parse(JSON.stringify(state));
    const card = newState.players[user.$id][index];

    if (!isValidMove(card, topCard)) {
      return setMessage("❌ Invalid move");
    }

    newState.players[user.$id].splice(index, 1);
    newState.discard.push(card);

    // WHOT RULES
    if (card.number === 2) {
      newState.players[opponent].push(safeDraw(newState));
      newState.players[opponent].push(safeDraw(newState));
      newState.turn = user.$id;
    } else if (card.number === 8) {
      newState.turn = user.$id;
    } else if (card.number === 14) {
      newState.players[opponent].push(safeDraw(newState));
      newState.turn = user.$id;
    } else if (card.number === 1) {
      newState.turn = user.$id;
    } else {
      newState.turn = opponent;
    }

    await checkWinner(newState);

    await databases.updateDocument(DB_ID, GAMES_COLLECTION_ID, id, {
      state: JSON.stringify(newState),
      lastMove: Date.now().toString()
    });
  }

  // =========================
  // 🃏 DRAW
  // =========================
  async function drawCard() {
    if (state.turn !== user.$id) return;

    const newState = JSON.parse(JSON.stringify(state));
    const card = safeDraw(newState);

    newState.players[user.$id].push(card);
    newState.turn = opponent;

    await databases.updateDocument(DB_ID, GAMES_COLLECTION_ID, id, {
      state: JSON.stringify(newState),
      lastMove: Date.now().toString()
    });
  }

  // =========================
  // 🏆 ROUND SYSTEM
  // =========================
  async function checkWinner(newState) {
    let roundWinner = null;

    if (newState.players[user.$id].length === 0) {
      roundWinner = user.$id;
    }

    if (newState.players[opponent].length === 0) {
      roundWinner = opponent;
    }

    if (!roundWinner) return;

    const scores = game.scores || {};
    scores[roundWinner] = (scores[roundWinner] || 0) + 1;

    const nextRound = (game.round || 1) + 1;

    if (nextRound > 3) {
      const finalWinner =
        (scores[user.$id] || 0) > (scores[opponent] || 0)
          ? user.$id
          : opponent;

      await finishGame(finalWinner);
      return;
    }

    const deck = generateDeck();

    const newStateRound = {
      players: {
        [user.$id]: deck.splice(0, 6),
        [opponent]: deck.splice(0, 6)
      },
      deck,
      discard: [deck.pop()],
      turn: roundWinner
    };

    await databases.updateDocument(DB_ID, GAMES_COLLECTION_ID, id, {
      state: JSON.stringify(newStateRound),
      round: nextRound,
      scores,
      lastMove: Date.now().toString()
    });

    setMessage("🏆 Round finished");
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

    await databases.updateDocument(DB_ID, GAMES_COLLECTION_ID, id, {
      finished: true,
      winner: winnerId
    });
  }

  // =========================
  // 🚪 QUIT SYSTEM
  // =========================
  async function quitGame() {
    const me = user.$id;
    const pot = game.pot || 0;
    const round = game.round || 1;

    const myStake = pot / 2;

    let refund = 0;

    if (round === 1) refund = myStake;
    else if (round === 2) refund = myStake * 0.5;
    else refund = 0;

    if (refund > 0) {
      const wallet = await getWallet(me);
      await rewardWinner(wallet, refund);
    }

    const opponentWallet = await getWallet(opponent);
    await rewardWinner(opponentWallet, pot - refund);

    await databases.updateDocument(DB_ID, GAMES_COLLECTION_ID, id, {
      finished: true,
      winner: opponent,
      quitBy: me
    });

    setMessage("🚪 You quit");
  }

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "auto" }}>
      <h2>🎮 Multiplayer WHOT</h2>

      <p>
        {state.turn === user.$id ? "🟢 Your Turn" : "🔴 Opponent"}
      </p>

      <p>
        Round: {game.round || 1}/3 | Pot: {game.pot || 0} 🪙
      </p>

      <p>
        You: {game.scores?.[user.$id] || 0} | Opponent:{" "}
        {game.scores?.[opponent] || 0}
      </p>

      {message && <p style={{ color: "yellow" }}>{message}</p>}

      {game.quitBy && <p>⚠️ Player quit</p>}

      <hr />

      <h3>Top Card</h3>
      <p>
        {topCard?.shape} {topCard?.number}
      </p>

      <button onClick={drawCard}>Draw</button>
      <button onClick={quitGame} style={{ marginLeft: 10 }}>
        Quit
      </button>

      {!hasValidMove(myHand, topCard) && (
        <p>⚠️ No valid move</p>
      )}

      <hr />

      <h3>Your Cards</h3>

      {myHand.map((c, i) => (
        <button key={i} onClick={() => playCard(i)}>
          {c.shape} {c.number}
        </button>
      ))}
    </div>
  );
}
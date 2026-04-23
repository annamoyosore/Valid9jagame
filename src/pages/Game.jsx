import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { databases, DB_ID, GAMES_COLLECTION_ID } from "../lib/appwrite";

export default function Game() {
  const { id } = useParams();
  const [game, setGame] = useState(null);

  useEffect(() => {
    loadGame();
  }, []);

  async function loadGame() {
    const g = await databases.getDocument(DB_ID, GAMES_COLLECTION_ID, id);
    setGame(g);
  }

  if (!game) return <p>Loading game...</p>;

  return (
    <div>
      <h1>Game Started 🎮</h1>
      <p>Players: {game.players.length}</p>
      <p>Stake: {game.stake}</p>
      <p>Pot: {game.pot}</p>
    </div>
  );
}
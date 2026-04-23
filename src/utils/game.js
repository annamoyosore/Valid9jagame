import {
  databases,
  ID,
  DB_ID,
  GAMES_COLLECTION_ID
} from "../lib/appwrite";

// 🎮 find or create game
export async function findOrCreateGame(userId, stake) {
  const res = await databases.listDocuments(DB_ID, GAMES_COLLECTION_ID);

  // 🔍 find waiting game with same stake
  let game = res.documents.find(
    g => g.status === "waiting" && g.stake === stake
  );

  if (game) {
    // join game
    return databases.updateDocument(
      DB_ID,
      GAMES_COLLECTION_ID,
      game.$id,
      {
        players: [...game.players, userId],
        status: "playing",
        pot: stake * 2,
        turn: game.players[0],
        currentRound: 1
      }
    );
  }

  // 🆕 create new game
  return databases.createDocument(
    DB_ID,
    GAMES_COLLECTION_ID,
    ID.unique(),
    {
      players: [userId],
      stake,
      status: "waiting",
      pot: stake,
      currentRound: 1
    }
  );
}
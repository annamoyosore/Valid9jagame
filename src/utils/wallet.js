import {
  databases,
  ID,
  DB_ID,
  USERS_COLLECTION_ID,
  TX_COLLECTION_ID
} from "../lib/appwrite";

// ✅ create wallet (first login)
export async function createWallet(user) {
  return databases.createDocument(
    DB_ID,
    USERS_COLLECTION_ID,
    ID.unique(),
    {
      userId: user.$id,
      email: user.email,
      balance: 100, // 🎁 starter coins
      locked: 0
    }
  );
}

// ✅ get wallet
export async function getWallet(userId) {
  const res = await databases.listDocuments(DB_ID, USERS_COLLECTION_ID);

  return res.documents.find(u => u.userId === userId);
}

// 🔒 lock coins
export async function lockCoins(wallet, amount) {
  if (wallet.balance < amount) throw "Not enough balance";

  return databases.updateDocument(
    DB_ID,
    USERS_COLLECTION_ID,
    wallet.$id,
    {
      balance: wallet.balance - amount,
      locked: wallet.locked + amount
    }
  );
}

// 🔓 refund coins
export async function refundCoins(wallet, amount) {
  return databases.updateDocument(
    DB_ID,
    USERS_COLLECTION_ID,
    wallet.$id,
    {
      balance: wallet.balance + amount,
      locked: wallet.locked - amount
    }
  );
}

// 🏆 reward winner
export async function rewardWinner(wallet, amount) {
  return databases.updateDocument(
    DB_ID,
    USERS_COLLECTION_ID,
    wallet.$id,
    {
      balance: wallet.balance + amount,
      locked: wallet.locked - amount
    }
  );
}

// 🧾 log transaction
export async function logTx(userId, type, amount) {
  return databases.createDocument(
    DB_ID,
    TX_COLLECTION_ID,
    ID.unique(),
    {
      userId,
      type,
      amount,
      status: "completed",
      createdAt: new Date().toISOString()
    }
  );
}
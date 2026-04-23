import { Client, Account, Databases, ID } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://nyc.cloud.appwrite.io/v1") // your region is correct
  .setProject("69cb4e5c001651f6cfab");

// 🔐 Auth
export const account = new Account(client);

// 🗄️ Database
export const databases = new Databases(client);

// 🆔 ID generator
export { ID };

// 📌 CENTRAL CONFIG (VERY IMPORTANT)
export const DB_ID = "6970a6be003068d274d1";

// 🔴 REPLACE THESE WITH YOUR REAL COLLECTION IDs
export const USERS_COLLECTION_ID = "YOUR_USERS_COLLECTION_ID";
export const TX_COLLECTION_ID = "YOUR_TX_COLLECTION_ID";

// (future)
// export const GAMES_COLLECTION_ID = "...";

export default client;
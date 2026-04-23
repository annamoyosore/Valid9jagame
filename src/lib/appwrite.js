import { Client, Account } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1") // default cloud
  .setProject("YOUR_PROJECT_ID"); // 🔴 replace this

export const account = new Account(client);
export default client;
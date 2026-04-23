import { Client, Account } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://nyc.cloud.appwrite.io/v1") // default cloud
  .setProject("69cb4e5c001651f6cfab"); // 🔴 replace this

export const account = new Account(client);
export default client;
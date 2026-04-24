import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../lib/appwrite";
import { getWallet, createWallet } from "../utils/wallet";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function getUser() {
    try {
      const res = await account.get();
      setUser(res);

      handleWallet(res);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleWallet(user) {
    try {
      let wallet = await getWallet(user.$id);

      if (!wallet) {
        await createWallet(user);
        console.log("✅ Wallet created");
      }
    } catch (err) {
      console.log("Wallet error", err);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  async function logout() {
    await account.deleteSession("current");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, getUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
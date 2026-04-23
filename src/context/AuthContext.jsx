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

      // 🔁 AUTO CREATE WALLET HERE
      let wallet = await getWallet(res.$id);

      if (!wallet) {
        await createWallet(res);
        console.log("✅ Wallet created");
      }

    } catch {
      setUser(null);
    }

    setLoading(false);
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
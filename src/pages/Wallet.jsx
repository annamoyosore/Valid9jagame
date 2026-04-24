import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getWallet } from "../utils/wallet";

export default function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    if (user) loadWallet();
  }, [user]);

  async function loadWallet() {
    const w = await getWallet(user.$id);
    setWallet(w);
  }

  if (!wallet) return <p>Loading wallet...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Wallet</h1>

      <p>Balance: {wallet.balance} 🪙</p>
      <p>Locked: {wallet.locked} 🔒</p>
    </div>
  );
}
import { useAuth } from "../context/AuthContext";
import { getWallet, lockCoins } from "../utils/wallet";

const { user } = useAuth();

async function startMatch() {
  if (!stake) return;

  const wallet = await getWallet(user.$id);

  try {
    await lockCoins(wallet, Number(stake));
    console.log("🔒 Coins locked");

    // 👉 matchmaking comes next (Step 4)
  } catch {
    alert("Not enough balance");
  }
}
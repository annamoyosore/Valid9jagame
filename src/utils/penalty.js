import { refundCoins } from "./wallet";

export async function handleQuit(game, userId) {
  const round = game.round || 1;

  const stake = game.stake;

  const wallet = await getWallet(userId);

  // 🟢 ROUND 1 → FULL REFUND
  if (round === 1) {
    return refundCoins(wallet, stake);
  }

  // 🟡 ROUND 2 → 50% LOSS
  if (round === 2) {
    return refundCoins(wallet, Math.floor(stake * 0.5));
  }

  // 🔴 ROUND 3 → NO REFUND
}
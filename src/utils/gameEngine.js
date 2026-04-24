export function createGameState(player1, player2, deck) {
  return {
    players: {
      [player1]: deck.splice(0, 6),
      [player2]: deck.splice(0, 6)
    },
    deck,
    discard: [deck.pop()],
    turn: player1,
    requestedShape: null
  };
}
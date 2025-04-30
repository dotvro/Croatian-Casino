let deck = [];
let playerHand = [];
let dealerHand = [];
let playerChips = 100;
let currentBet = 0;
let gameInProgress = false;
let accumulatedBet = 0;  // Variable to store the accumulated bet

const chipsDisplay = document.getElementById("chips");
const betDisplay = document.getElementById("current-bet");
const playerCards = document.getElementById("player-cards");
const dealerCards = document.getElementById("dealer-cards");
const playerScoreDisplay = document.getElementById("player-score");
const dealerScoreDisplay = document.getElementById("dealer-score");
const resultDisplay = document.getElementById("result");

document.getElementById("start").addEventListener("click", startGame);
document.getElementById("hit").addEventListener("click", playerHit);
document.getElementById("stand").addEventListener("click", dealerTurn);

function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  return suits.flatMap(suit => values.map(value => ({ suit, value })));
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function cardValue(card) {
  if (["J", "Q", "K"].includes(card.value)) return 10;
  if (card.value === "A") return 11;
  return parseInt(card.value);
}

function calculateScore(hand) {
  let score = 0;
  let aces = 0;
  for (let card of hand) {
    score += cardValue(card);
    if (card.value === "A") aces++;
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
}

function updateUI() {
  chipsDisplay.textContent = playerChips;
  betDisplay.textContent = `Current Bet: $${accumulatedBet}`;  // Show accumulated bet
  playerCards.innerHTML = '';
  dealerCards.innerHTML = '';

  playerHand.forEach(card => {
    playerCards.innerHTML += `<div class="card">${card.value}${card.suit}</div>`;
  });

  dealerHand.forEach((card, i) => {
    if (!gameInProgress && i === 1) {
      dealerCards.innerHTML += `<div class="card">🂠</div>`;
    } else {
      dealerCards.innerHTML += `<div class="card">${card.value}${card.suit}</div>`;
    }
  });

  playerScoreDisplay.textContent = `Score: ${calculateScore(playerHand)}`;
  dealerScoreDisplay.textContent = gameInProgress ? `Score: ${calculateScore(dealerHand)}` : "";
}

function placeBet(amount) {
  if (gameInProgress || accumulatedBet >= playerChips || accumulatedBet + amount > playerChips) return;

  accumulatedBet += amount;
  playerChips -= amount;
  updateUI();
}

function startGame() {
  if (accumulatedBet === 0 || gameInProgress) return;

  gameInProgress = true;
  deck = createDeck();
  shuffle(deck);
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  resultDisplay.textContent = '';
  document.getElementById("hit").disabled = false;
  document.getElementById("stand").disabled = false;

  updateUI();

  if (calculateScore(playerHand) === 21) {
    endGame("blackjack");
  }
}

function playerHit() {
  if (!gameInProgress) return;
  playerHand.push(deck.pop());
  updateUI();

  const score = calculateScore(playerHand);
  if (score >= 21) {
    document.getElementById("hit").disabled = true;
    document.getElementById("stand").disabled = true;
    setTimeout(() => {
      endGame(score === 21 ? "blackjack" : "lose");
    }, 800);
  }
}

function dealerTurn() {
  if (!gameInProgress) return;

  document.getElementById("hit").disabled = true;
  document.getElementById("stand").disabled = true;

  while (calculateScore(dealerHand) < 17) {
    dealerHand.push(deck.pop());
  }

  updateUI();

  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  if (dealerScore > 21 || playerScore > dealerScore) {
    endGame("win");
  } else if (playerScore === dealerScore) {
    endGame("draw");
  } else {
    endGame("lose");
  }
}

function endGame(result) {
  gameInProgress = false;

  if (result === "blackjack") {
    playerChips += accumulatedBet * 2.5;
    resultDisplay.textContent = "BLACKJACK! You win 2.5x!";
  } else if (result === "win") {
    playerChips += accumulatedBet * 2;
    resultDisplay.textContent = "You win!";
  } else if (result === "draw") {
    playerChips += accumulatedBet;
    resultDisplay.textContent = "Push (Draw)";
  } else {
    resultDisplay.textContent = "You lose!";
  }

  accumulatedBet = 0;  // Reset accumulated bet after each round
  updateUI();

  setTimeout(() => {
    playerHand = [];
    dealerHand = [];
    resultDisplay.textContent = '';
    updateUI();
  }, 2000);
}

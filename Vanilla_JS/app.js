import { ZeroCross } from "./zeroCross.js";

const game = new ZeroCross(3, "O", "X", true);
let vsComputer = true;
let difficulty = "unbeatable";
const aiSymbol = "X";
const scores = { O: 0, X: 0, DRAW: 0 };

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status-text");
const scoreOEl = document.getElementById("score-o");
const scoreXEl = document.getElementById("score-x");
const scoreDrawEl = document.getElementById("score-draw");
const modeBtn = document.getElementById("mode-btn");
const diffBtn = document.getElementById("diff-btn");
const resetBtn = document.getElementById("reset-btn");

function buildGrid() {
  boardEl.innerHTML = "";
  for (let i = 0; i < game.boardSize * game.boardSize; i++) {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.dataset.index = String(i);
    cell.addEventListener("click", () => onCellClick(i));
    boardEl.appendChild(cell);
  }
  render();
}

function onCellClick(index) {
  if (game.gameState() !== null) return;
  if (vsComputer && game.whoseChance() === aiSymbol) return;
  if (!game.makeMove(index)) return;

  checkScoreUpdate();
  render();

  if (vsComputer && game.gameState() === null && game.whoseChance() === aiSymbol) {
    setTimeout(() => {
      const move = game.computeBestMove(difficulty);
      if (move !== null) {
        game.makeMove(move);
        checkScoreUpdate();
        render();
      }
    }, 180);
  }
}

function checkScoreUpdate() {
  const state = game.gameState();
  if (state !== null) {
    scores[state] = (scores[state] || 0) + 1;
    scoreOEl.textContent = String(scores.O);
    scoreXEl.textContent = String(scores.X);
    scoreDrawEl.textContent = String(scores.DRAW);
  }
}

function render() {
  const cells = boardEl.querySelectorAll(".cell");
  const winSet = new Set(game.winningLine || []);

  cells.forEach((cell, idx) => {
    const val = game.getCell(idx);
    cell.textContent = val;
    cell.className = "cell";
    if (val === "O") cell.classList.add("cell-o");
    if (val === "X") cell.classList.add("cell-x");
    if (winSet.has(idx)) cell.classList.add("cell-win");
  });

  const state = game.gameState();
  if (state === "DRAW") {
    statusEl.textContent = "Round Draw!";
  } else if (state !== null) {
    statusEl.textContent = `Winner: ${state}!`;
  } else {
    const turn = game.whoseChance();
    const role = vsComputer && turn === aiSymbol ? "Computer" : "Player";
    statusEl.textContent = `Turn: ${turn} (${role})`;
  }
}

modeBtn.addEventListener("click", () => {
  vsComputer = !vsComputer;
  modeBtn.textContent = vsComputer ? "Mode: vs Computer" : "Mode: 2 Players";
  diffBtn.style.display = vsComputer ? "inline-block" : "none";
  game.reset(true);
  render();
});

diffBtn.addEventListener("click", () => {
  difficulty = difficulty === "unbeatable" ? "casual" : "unbeatable";
  diffBtn.textContent =
    difficulty === "unbeatable" ? "AI: Unbeatable" : "AI: Casual";
  game.reset(true);
  render();
});

resetBtn.addEventListener("click", () => {
  game.reset(true);
  render();
});

buildGrid();

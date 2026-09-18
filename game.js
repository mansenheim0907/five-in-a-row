"use strict";

const SIZE = 15;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;
const DIRECTIONS = [[1, 0], [0, 1], [1, 1], [1, -1]];

const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#status");
const modeElement = document.querySelector("#game-mode");
const difficultyElement = document.querySelector("#difficulty");
const difficultyField = document.querySelector("#difficulty-field");
const dialogElement = document.querySelector("#game-dialog");

let board;
let currentPlayer;
let gameOver;
let computerThinking;
let scores = { black: 0, white: 0, draw: 0 };

function resetGame() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  currentPlayer = BLACK;
  gameOver = false;
  computerThinking = false;
  dialogElement.hidden = true;
  renderBoard();
  updateStatus();
}

function renderBoard() {
  boardElement.replaceChildren();
  const fragment = document.createDocumentFragment();
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const cell = document.createElement("button");
      cell.className = "intersection";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `Rad ${row + 1}, kolumn ${col + 1}`);
      cell.addEventListener("click", handleCellClick);
      fragment.append(cell);
    }
  }
  boardElement.append(fragment);
}

function handleCellClick(event) {
  if (gameOver || computerThinking) return;
  const row = Number(event.currentTarget.dataset.row);
  const col = Number(event.currentTarget.dataset.col);
  if (!placeStone(row, col, currentPlayer)) return;
  if (finishTurn(row, col)) return;

  currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
  updateStatus();
  if (modeElement.value === "computer" && currentPlayer === WHITE) computerMove();
}

function placeStone(row, col, player) {
  if (board[row][col] !== EMPTY) return false;
  board[row][col] = player;
  const cell = getCell(row, col);
  cell.classList.add(player === BLACK ? "black" : "white");
  cell.setAttribute("aria-label", `${cell.getAttribute("aria-label")}, ${playerName(player)}`);
  return true;
}

function finishTurn(row, col) {
  const winningCells = findWinningLine(row, col);
  if (winningCells.length) {
    gameOver = true;
    winningCells.forEach(([r, c]) => getCell(r, c).classList.add("winning"));
    const key = currentPlayer === BLACK ? "black" : "white";
    scores[key] += 1;
    updateScore();
    showResult(`${playerName(currentPlayer)} vinner!`, currentPlayer);
    return true;
  }
  if (board.every(rowValues => rowValues.every(Boolean))) {
    gameOver = true;
    scores.draw += 1;
    updateScore();
    showResult("Oavgjort", EMPTY);
    return true;
  }
  return false;
}

function computerMove() {
  computerThinking = true;
  statusElement.textContent = "Datorn tänker…";
  window.setTimeout(() => {
    const move = chooseComputerMove(difficultyElement.value);
    if (!move || gameOver) return;
    placeStone(move.row, move.col, WHITE);
    computerThinking = false;
    if (finishTurn(move.row, move.col)) return;
    currentPlayer = BLACK;
    updateStatus();
  }, 350);
}

function chooseComputerMove(difficulty) {
  const candidates = candidateMoves();
  if (!candidates.length) return { row: Math.floor(SIZE / 2), col: Math.floor(SIZE / 2) };
  if (difficulty === "easy" && Math.random() < 0.7) return randomChoice(candidates);

  const scored = candidates.map(move => {
    const attack = scorePosition(move.row, move.col, WHITE);
    const defence = scorePosition(move.row, move.col, BLACK);
    const center = 7 - (Math.abs(move.row - 7) + Math.abs(move.col - 7)) * 0.08;
    const noise = difficulty === "medium" ? Math.random() * 35 : Math.random() * 3;
    return { ...move, score: Math.max(attack * 1.12, defence) + attack * .15 + center + noise };
  });
  scored.sort((a, b) => b.score - a.score);
  if (difficulty === "medium") return randomChoice(scored.slice(0, Math.min(3, scored.length)));
  return scored[0];
}

function candidateMoves() {
  const candidates = [];
  let hasStone = false;
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col] !== EMPTY) { hasStone = true; continue; }
      let nearby = false;
      for (let dr = -2; dr <= 2 && !nearby; dr += 1) {
        for (let dc = -2; dc <= 2; dc += 1) {
          if (isInside(row + dr, col + dc) && board[row + dr][col + dc] !== EMPTY) { nearby = true; break; }
        }
      }
      if (nearby) candidates.push({ row, col });
    }
  }
  return hasStone ? candidates : [{ row: 7, col: 7 }];
}

function scorePosition(row, col, player) {
  let best = 0;
  for (const [dr, dc] of DIRECTIONS) {
    const forward = countDirection(row, col, dr, dc, player);
    const backward = countDirection(row, col, -dr, -dc, player);
    const length = 1 + forward.count + backward.count;
    const openEnds = Number(forward.open) + Number(backward.open);
    let score = length * length * 12 + openEnds * 8;
    if (length >= 5) score = 1_000_000;
    else if (length === 4 && openEnds) score = 50_000 + openEnds * 5_000;
    else if (length === 3 && openEnds === 2) score = 4_000;
    else if (length === 3) score = 900;
    else if (length === 2 && openEnds === 2) score = 350;
    best = Math.max(best, score);
  }
  return best;
}

function countDirection(row, col, dr, dc, player) {
  let count = 0;
  let r = row + dr;
  let c = col + dc;
  while (isInside(r, c) && board[r][c] === player) { count += 1; r += dr; c += dc; }
  return { count, open: isInside(r, c) && board[r][c] === EMPTY };
}

function findWinningLine(row, col) {
  const player = board[row][col];
  for (const [dr, dc] of DIRECTIONS) {
    const line = [[row, col]];
    for (const sign of [-1, 1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (isInside(r, c) && board[r][c] === player) { line.push([r, c]); r += dr * sign; c += dc * sign; }
    }
    if (line.length >= 5) return line;
  }
  return [];
}

function showResult(message, winner) {
  document.querySelector("#dialog-title").textContent = message;
  document.querySelector("#dialog-message").textContent = winner ? `${playerName(winner)} fick fem i rad.` : "Brädet är fullt utan någon vinnare.";
  const stone = document.querySelector("#winner-stone");
  stone.hidden = winner === EMPTY;
  stone.className = `winner-stone${winner === WHITE ? " white" : ""}`;
  dialogElement.hidden = false;
}

function updateStatus() {
  if (modeElement.value === "computer") statusElement.textContent = currentPlayer === BLACK ? "Din tur – du spelar svart" : "Datorns tur – vit";
  else statusElement.textContent = `${playerName(currentPlayer)}s tur`;
}

function updateScore() {
  document.querySelector("#black-score").textContent = scores.black;
  document.querySelector("#white-score").textContent = scores.white;
  document.querySelector("#draw-score").textContent = scores.draw;
}

function getCell(row, col) { return boardElement.children[row * SIZE + col]; }
function isInside(row, col) { return row >= 0 && row < SIZE && col >= 0 && col < SIZE; }
function playerName(player) { return player === BLACK ? "Svart" : "Vit"; }
function randomChoice(items) { return items[Math.floor(Math.random() * items.length)]; }

document.querySelector("#new-game").addEventListener("click", resetGame);
document.querySelector("#play-again").addEventListener("click", resetGame);
modeElement.addEventListener("change", () => { difficultyField.hidden = modeElement.value !== "computer"; scores = { black: 0, white: 0, draw: 0 }; updateScore(); resetGame(); });
difficultyElement.addEventListener("change", resetGame);

resetGame();

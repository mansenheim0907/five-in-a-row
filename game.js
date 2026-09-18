"use strict";

const SIZE = 15;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;
const CENTER = Math.floor(SIZE / 2);
const DIRECTIONS = [[1, 0], [0, 1], [1, 1], [1, -1]];

const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#status");
const hintElement = document.querySelector("#rule-hint");
const modeElement = document.querySelector("#game-mode");
const rulesElement = document.querySelector("#rule-set");
const difficultyElement = document.querySelector("#difficulty");
const difficultyField = document.querySelector("#difficulty-field");
const dialogElement = document.querySelector("#game-dialog");
const languageElement = document.querySelector("#language");

const translations = {
  sv: {
    pageTitle: "Fem i rad", eyebrow: "KLASSISKT BRÄDSPEL", title: "Fem i rad",
    subtitle: "Utmana datorn eller spela tillsammans på samma skärm.", gameArea: "Spelområde",
    language: "Språk", gameMode: "Spelläge", computer: "Mot datorn", local: "Två spelare",
    difficulty: "Svårighetsgrad", easy: "Lätt", medium: "Medel", hard: "Svår",
    rules: "Regler", freeRules: "Fritt fem i rad", newGame: "Nytt spel",
    sessionScore: "Resultat denna session", black: "Svart", white: "Vit", draw: "Oavgjort",
    boardAria: "Spelbräde, 15 gånger 15", gameOver: "Spelet är slut", playAgain: "Spela igen",
    rowCol: "Rad {row}, kolumn {col}", latestMove: "senaste draget", occupied: "Rutan är redan upptagen.",
    firstCenter: "I Renju måste svarts första sten placeras i mitten.",
    overline: "Förbjudet drag: svart får inte skapa en överlinje (sex eller fler).",
    doubleFour: "Förbjudet drag: dubbel-fyra.", doubleThree: "Förbjudet drag: dubbel-trea.",
    computerThinking: "Datorn tänker…", renjuStart: "Svart börjar – placera första stenen i mitten",
    yourTurn: "Din tur – du spelar svart", computerTurn: "Datorns tur – vit", playerTurn: "{player}s tur",
    blackName: "Svart", whiteName: "Vit", wins: "{player} vinner!", fiveInRow: "{player} fick fem i rad.",
    boardFull: "Brädet är fullt utan någon vinnare.",
    renjuHint: "Renju: svart börjar i mitten och får inte göra överlinje, dubbel-trea eller dubbel-fyra.",
    freeHint: "Fritt spel: placera fem eller fler stenar i rad – vågrätt, lodrätt eller diagonalt."
  },
  en: {
    pageTitle: "Five in a Row", eyebrow: "CLASSIC BOARD GAME", title: "Five in a Row",
    subtitle: "Challenge the computer or play together on the same screen.", gameArea: "Game area",
    language: "Language", gameMode: "Game mode", computer: "Vs computer", local: "Two players",
    difficulty: "Difficulty", easy: "Easy", medium: "Medium", hard: "Hard",
    rules: "Rules", freeRules: "Freestyle five in a row", newGame: "New game",
    sessionScore: "Score this session", black: "Black", white: "White", draw: "Draw",
    boardAria: "Game board, 15 by 15", gameOver: "Game over", playAgain: "Play again",
    rowCol: "Row {row}, column {col}", latestMove: "latest move", occupied: "That intersection is already occupied.",
    firstCenter: "In Renju, Black's first stone must be placed in the centre.",
    overline: "Forbidden move: Black may not create an overline (six or more).",
    doubleFour: "Forbidden move: double four.", doubleThree: "Forbidden move: double three.",
    computerThinking: "The computer is thinking…", renjuStart: "Black starts – place the first stone in the centre",
    yourTurn: "Your turn – you are Black", computerTurn: "Computer's turn – White", playerTurn: "{player}'s turn",
    blackName: "Black", whiteName: "White", wins: "{player} wins!", fiveInRow: "{player} made five in a row.",
    boardFull: "The board is full with no winner.",
    renjuHint: "Renju: Black starts in the centre and may not make an overline, double three or double four.",
    freeHint: "Freestyle: place five or more stones in a row – horizontally, vertically or diagonally."
  }
};

let board;
let currentPlayer;
let gameOver;
let computerThinking;
let moveCount;
let lastMove;
let statusTimer;
let language = localStorage.getItem("five-language") === "en" ? "en" : "sv";
let scores = { black: 0, white: 0, draw: 0 };

function t(key, values = {}) {
  return Object.entries(values).reduce((text, [name, value]) => text.replace(`{${name}}`, value), translations[language][key]);
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach(element => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria-label]").forEach(element => { element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel)); });
  updateBoardAriaLabels();
  updateRuleHint();
  updateStatus();
}

function resetGame() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  currentPlayer = BLACK;
  gameOver = false;
  computerThinking = false;
  moveCount = 0;
  lastMove = null;
  window.clearTimeout(statusTimer);
  statusElement.classList.remove("error");
  dialogElement.hidden = true;
  renderBoard();
  updateRuleHint();
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
      cell.setAttribute("aria-label", cellAriaLabel(row, col));
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
  const problem = validateMove(row, col, currentPlayer);
  if (problem) {
    showMoveError(problem);
    return;
  }
  placeStone(row, col, currentPlayer);
  if (finishTurn(row, col)) return;

  currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
  updateStatus();
  if (modeElement.value === "computer" && currentPlayer === WHITE) computerMove();
}

function validateMove(row, col, player) {
  if (!isInside(row, col) || board[row][col] !== EMPTY) return "occupied";
  if (rulesElement.value !== "renju" || player !== BLACK) return "";
  if (moveCount === 0 && (row !== CENTER || col !== CENTER)) return "firstCenter";

  board[row][col] = BLACK;
  let problem = "";
  if (!hasExactFive(row, col, BLACK)) {
    if (hasOverline(row, col, BLACK)) problem = "overline";
    else if (countFours(row, col) >= 2) problem = "doubleFour";
    else if (countOpenThrees(row, col) >= 2) problem = "doubleThree";
  }
  board[row][col] = EMPTY;
  return problem;
}

function placeStone(row, col, player) {
  board[row][col] = player;
  if (lastMove) {
    const previousMove = lastMove;
    lastMove = null;
    getCell(previousMove.row, previousMove.col).classList.remove("last-move");
    getCell(previousMove.row, previousMove.col).setAttribute("aria-label", cellAriaLabel(previousMove.row, previousMove.col));
  }
  const cell = getCell(row, col);
  cell.classList.add(player === BLACK ? "black" : "white", "last-move");
  lastMove = { row, col };
  cell.setAttribute("aria-label", cellAriaLabel(row, col));
  moveCount += 1;
}

function finishTurn(row, col) {
  const winningCells = findWinningLine(row, col);
  if (winningCells.length) {
    gameOver = true;
    winningCells.forEach(([r, c]) => getCell(r, c).classList.add("winning"));
    const key = currentPlayer === BLACK ? "black" : "white";
    scores[key] += 1;
    updateScore();
    showResult(currentPlayer);
    return true;
  }
  if (board.every(rowValues => rowValues.every(Boolean))) {
    gameOver = true;
    scores.draw += 1;
    updateScore();
    showResult(EMPTY);
    return true;
  }
  return false;
}

function computerMove() {
  computerThinking = true;
  statusElement.textContent = t("computerThinking");
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
  if (!candidates.length) return { row: CENTER, col: CENTER };
  if (difficulty === "easy" && Math.random() < 0.7) return randomChoice(candidates);

  const scored = candidates.map(move => {
    const attack = scorePosition(move.row, move.col, WHITE);
    const defence = scorePosition(move.row, move.col, BLACK);
    const center = 7 - (Math.abs(move.row - CENTER) + Math.abs(move.col - CENTER)) * 0.08;
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
  return hasStone ? candidates : [{ row: CENTER, col: CENTER }];
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

function lineLength(row, col, dr, dc, player) {
  return 1 + countDirection(row, col, dr, dc, player).count + countDirection(row, col, -dr, -dc, player).count;
}

function hasExactFive(row, col, player) {
  return DIRECTIONS.some(([dr, dc]) => lineLength(row, col, dr, dc, player) === 5);
}

function hasOverline(row, col, player) {
  return DIRECTIONS.some(([dr, dc]) => lineLength(row, col, dr, dc, player) >= 6);
}

function countFours(row, col) {
  let fours = 0;
  for (const [dr, dc] of DIRECTIONS) {
    const completions = new Set();
    for (let offset = -4; offset <= 0; offset += 1) {
      const cells = [];
      for (let index = 0; index < 5; index += 1) cells.push([row + (offset + index) * dr, col + (offset + index) * dc]);
      if (!cells.every(([r, c]) => isInside(r, c)) || !cells.some(([r, c]) => r === row && c === col)) continue;
      const values = cells.map(([r, c]) => board[r][c]);
      if (values.filter(value => value === BLACK).length !== 4 || values.filter(value => value === EMPTY).length !== 1) continue;
      const emptyIndex = values.indexOf(EMPTY);
      const [er, ec] = cells[emptyIndex];
      board[er][ec] = BLACK;
      if (lineLength(er, ec, dr, dc, BLACK) === 5) completions.add(`${er},${ec}`);
      board[er][ec] = EMPTY;
    }
    if (completions.size) fours += 1;
  }
  return fours;
}

function countOpenThrees(row, col) {
  let threes = 0;
  for (const [dr, dc] of DIRECTIONS) {
    let isOpenThree = false;
    for (let distance = -4; distance <= 4 && !isOpenThree; distance += 1) {
      if (distance === 0) continue;
      const r = row + distance * dr;
      const c = col + distance * dc;
      if (!isInside(r, c) || board[r][c] !== EMPTY) continue;
      board[r][c] = BLACK;
      const straightFour = straightFourEnds(r, c, dr, dc);
      const legalExtension = !hasOverline(r, c, BLACK) && countFours(r, c) < 2;
      board[r][c] = EMPTY;
      if (straightFour >= 2 && legalExtension) isOpenThree = true;
    }
    if (isOpenThree) threes += 1;
  }
  return threes;
}

function straightFourEnds(row, col, dr, dc) {
  const completions = new Set();
  for (let offset = -4; offset <= 0; offset += 1) {
    const cells = [];
    for (let index = 0; index < 5; index += 1) cells.push([row + (offset + index) * dr, col + (offset + index) * dc]);
    if (!cells.every(([r, c]) => isInside(r, c)) || !cells.some(([r, c]) => r === row && c === col)) continue;
    const values = cells.map(([r, c]) => board[r][c]);
    if (values.filter(value => value === BLACK).length !== 4 || values.filter(value => value === EMPTY).length !== 1) continue;
    const [er, ec] = cells[values.indexOf(EMPTY)];
    board[er][ec] = BLACK;
    if (lineLength(er, ec, dr, dc, BLACK) === 5) completions.add(`${er},${ec}`);
    board[er][ec] = EMPTY;
  }
  return completions.size;
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
    const winsInRenju = rulesElement.value !== "renju" || player === WHITE ? line.length >= 5 : line.length === 5;
    if (winsInRenju) return line;
  }
  return [];
}

function showMoveError(messageKey) {
  window.clearTimeout(statusTimer);
  statusElement.textContent = t(messageKey);
  statusElement.classList.add("error");
  statusTimer = window.setTimeout(() => {
    statusElement.classList.remove("error");
    updateStatus();
  }, 2600);
}

function showResult(winner) {
  document.querySelector("#dialog-title").textContent = winner ? t("wins", { player: playerName(winner) }) : t("draw");
  document.querySelector("#dialog-message").textContent = winner ? t("fiveInRow", { player: playerName(winner) }) : t("boardFull");
  const stone = document.querySelector("#winner-stone");
  stone.hidden = winner === EMPTY;
  stone.className = `winner-stone${winner === WHITE ? " white" : ""}`;
  dialogElement.hidden = false;
}

function updateRuleHint() {
  hintElement.textContent = rulesElement.value === "renju"
    ? t("renjuHint")
    : t("freeHint");
}

function updateStatus() {
  if (rulesElement.value === "renju" && moveCount === 0) {
    statusElement.textContent = t("renjuStart");
  } else if (modeElement.value === "computer") {
    statusElement.textContent = currentPlayer === BLACK ? t("yourTurn") : t("computerTurn");
  } else {
    statusElement.textContent = t("playerTurn", { player: playerName(currentPlayer) });
  }
}

function updateScore() {
  document.querySelector("#black-score").textContent = scores.black;
  document.querySelector("#white-score").textContent = scores.white;
  document.querySelector("#draw-score").textContent = scores.draw;
}

function getCell(row, col) { return boardElement.children[row * SIZE + col]; }
function isInside(row, col) { return row >= 0 && row < SIZE && col >= 0 && col < SIZE; }
function playerName(player) { return player === BLACK ? t("blackName") : t("whiteName"); }
function randomChoice(items) { return items[Math.floor(Math.random() * items.length)]; }

function cellAriaLabel(row, col) {
  let label = t("rowCol", { row: row + 1, col: col + 1 });
  if (board?.[row]?.[col]) label += `, ${playerName(board[row][col])}`;
  if (lastMove?.row === row && lastMove?.col === col) label += `, ${t("latestMove")}`;
  return label;
}

function updateBoardAriaLabels() {
  if (!boardElement.children.length || !board) return;
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) getCell(row, col).setAttribute("aria-label", cellAriaLabel(row, col));
  }
}

document.querySelector("#new-game").addEventListener("click", resetGame);
document.querySelector("#play-again").addEventListener("click", resetGame);
modeElement.addEventListener("change", () => { difficultyField.hidden = modeElement.value !== "computer"; scores = { black: 0, white: 0, draw: 0 }; updateScore(); resetGame(); });
rulesElement.addEventListener("change", () => { scores = { black: 0, white: 0, draw: 0 }; updateScore(); resetGame(); });
difficultyElement.addEventListener("change", resetGame);
languageElement.addEventListener("change", () => {
  language = languageElement.value;
  localStorage.setItem("five-language", language);
  applyLanguage();
});

languageElement.value = language;
resetGame();
applyLanguage();

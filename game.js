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
const openingPanel = document.querySelector("#opening-panel");
const openingMessage = document.querySelector("#opening-message");
const keepColorsButton = document.querySelector("#keep-colors");
const swapColorsButton = document.querySelector("#swap-colors");
const offerTenButton = document.querySelector("#offer-ten");
const onlinePanel = document.querySelector("#online-panel");
const onlineLobby = document.querySelector("#online-lobby");
const onlineRoom = document.querySelector("#online-room");
const onlineNameInput = document.querySelector("#online-name");
const onlineCodeInput = document.querySelector("#online-code");
const onlinePlayers = document.querySelector("#online-players");
const roomCodeButton = document.querySelector("#copy-code");

const SUPABASE_URL = "https://vihncukhitijhrvgvonw.supabase.co";
const SUPABASE_KEY = "sb_publishable_cekFLm639kSdmlifG7YFWw_O-EFse4C";

const translations = {
  sv: {
    pageTitle: "Fem i rad", eyebrow: "KLASSISKT BRÄDSPEL", title: "Fem i rad",
    subtitle: "Utmana datorn eller spela tillsammans på samma skärm.", gameArea: "Spelområde",
    language: "Språk", gameMode: "Spelläge", computer: "Mot datorn", local: "Två spelare", online: "Spela online",
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
    freeHint: "Fritt spel: placera fem eller fler stenar i rad – vågrätt, lodrätt eller diagonalt.",
    keepColors: "Behåll färger", swapColors: "Byt färger", offerTen: "Föreslå 10 positioner",
    continueAs: "Fortsätt som {color}", takeOver: "Ta över {color}",
    openingDecision: "Öppningsval efter drag {move} av 6 – {player} väljer färg.", computerDecision: "Datorn väljer färg…",
    openingZone: "Öppningsdrag {move} måste placeras inom centrumområdet {size}×{size}.",
    offerStatus: "Markera position {count} av 10. Vit väljer sedan vilken som blir svarts femte sten.",
    chooseProposal: "Välj en markerad position. Endast den blir svarts femte sten; de andra försvinner.",
    proposalOnly: "Välj en av de tio markerade positionerna.",
    symmetricProposal: "Förslaget är symmetriskt med ett tidigare förslag. Välj en annan position.",
    playerLabel: "Spelare {seat}", yourTurnColor: "Din tur – du spelar {color}",
    computerTurnColor: "Datorns tur – {color}", localTurn: "Spelare {seat} – {color}s tur",
    renjuHint: "Renju med Taraguchi-10: följ öppningsområdena och välj om färgerna ska bytas. Svart får inte göra överlinje, dubbel-trea eller dubbel-fyra.",
    yourName: "Ditt namn", namePlaceholder: "Spelare", createMatch: "Skapa match", or: "eller",
    matchCode: "Matchkod", joinMatch: "Gå med", leaveMatch: "Lämna matchen", copyCode: "Kopiera matchkod",
    copied: "Matchkoden är kopierad.", onlineWaiting: "Väntar på motspelare – dela koden {code}",
    onlineYourTurn: "Din tur – du spelar {color}", onlineOpponentTurn: "{name}s tur – du spelar {color}",
    onlinePlayers: "{black} (svart) mot {white} (vit)", onlineError: "Det gick inte att ansluta. Försök igen.",
    invalidCode: "Ange en matchkod med 6 tecken.", onlineBusy: "Ansluter…", onlineOnlyFree: "Onlineläget använder fritt fem-i-rad.",
    notYourTurn: "Det är inte din tur.", waitingForOpponent: "Vänta tills en motspelare har anslutit.",
    playerLeft: "{player} lämnade matchen."
  },
  en: {
    pageTitle: "Five in a Row", eyebrow: "CLASSIC BOARD GAME", title: "Five in a Row",
    subtitle: "Challenge the computer or play together on the same screen.", gameArea: "Game area",
    language: "Language", gameMode: "Game mode", computer: "Vs computer", local: "Two players", online: "Play online",
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
    freeHint: "Freestyle: place five or more stones in a row – horizontally, vertically or diagonally.",
    keepColors: "Keep colours", swapColors: "Swap colours", offerTen: "Propose 10 positions",
    continueAs: "Continue as {color}", takeOver: "Take over {color}",
    openingDecision: "Opening choice after move {move} of 6 – {player} chooses a colour.", computerDecision: "The computer is choosing colours…",
    openingZone: "Opening move {move} must be placed inside the central {size}×{size} area.",
    offerStatus: "Mark position {count} of 10. White then chooses which becomes Black's fifth stone.",
    chooseProposal: "Choose one marked position. Only that one becomes Black's fifth stone; the others disappear.",
    proposalOnly: "Choose one of the ten marked positions.",
    symmetricProposal: "That proposal is symmetrical to an earlier one. Choose another position.",
    playerLabel: "Player {seat}", yourTurnColor: "Your turn – you are {color}",
    computerTurnColor: "Computer's turn – {color}", localTurn: "Player {seat} – {color}'s turn",
    renjuHint: "Renju with Taraguchi-10: follow the opening zones and choose whether to swap colours. Black may not make an overline, double three or double four.",
    yourName: "Your name", namePlaceholder: "Player", createMatch: "Create match", or: "or",
    matchCode: "Match code", joinMatch: "Join", leaveMatch: "Leave match", copyCode: "Copy match code",
    copied: "Match code copied.", onlineWaiting: "Waiting for an opponent – share code {code}",
    onlineYourTurn: "Your turn – you are {color}", onlineOpponentTurn: "{name}'s turn – you are {color}",
    onlinePlayers: "{black} (Black) vs {white} (White)", onlineError: "Could not connect. Please try again.",
    invalidCode: "Enter a 6-character match code.", onlineBusy: "Connecting…", onlineOnlyFree: "Online mode uses freestyle five in a row.",
    notYourTurn: "It is not your turn.", waitingForOpponent: "Wait for an opponent to join.",
    playerLeft: "{player} left the match."
  }
};

let board;
let currentPlayer;
let gameOver;
let computerThinking;
let moveCount;
let lastMove;
let statusTimer;
let statusMode = "normal";
let blackSeat;
let openingState;
let decisionAfterMove;
let decisionSeat;
let proposalMoves;
let language = localStorage.getItem("five-language") === "en" ? "en" : "sv";
let scores = { black: 0, white: 0, draw: 0 };
let onlineSession = null;
let onlineState = null;
let onlinePollTimer = 0;
let onlineRequestPending = false;
let onlineResultShown = false;

function t(key, values = {}) {
  return Object.entries(values).reduce((text, [name, value]) => text.replace(`{${name}}`, value), translations[language][key]);
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach(element => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria-label]").forEach(element => { element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel)); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(element => { element.placeholder = t(element.dataset.i18nPlaceholder); });
  roomCodeButton.title = t("copyCode");
  updateBoardAriaLabels();
  updateRuleHint();
  updateOpeningPanel();
  updateStatus();
  if (onlineState) {
    onlinePlayers.textContent = t("onlinePlayers", {
      black: onlineState.hostName,
      white: onlineState.guestName || "…"
    });
  }
}

function resetGame() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  currentPlayer = BLACK;
  gameOver = false;
  computerThinking = false;
  moveCount = 0;
  lastMove = null;
  blackSeat = 1;
  openingState = "move";
  decisionAfterMove = 0;
  decisionSeat = 0;
  proposalMoves = [];
  window.clearTimeout(statusTimer);
  statusElement.classList.remove("error");
  dialogElement.hidden = true;
  openingPanel.hidden = true;
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
      cell.addEventListener("pointerenter", handleCellIntent);
      cell.addEventListener("pointerleave", clearCellIntent);
      cell.addEventListener("focus", handleCellIntent);
      cell.addEventListener("blur", clearCellIntent);
      fragment.append(cell);
    }
  }
  boardElement.append(fragment);
}

function handleCellClick(event) {
  if (gameOver || computerThinking) return;
  const row = Number(event.currentTarget.dataset.row);
  const col = Number(event.currentTarget.dataset.col);
  if (modeElement.value === "online") {
    playOnlineMove(row, col);
    return;
  }
  if (openingState === "decision") return;
  if (openingState === "choose") {
    chooseProposedMove(row, col);
    return;
  }
  const problem = validateMove(row, col, currentPlayer);
  if (problem) {
    showMoveError(problem, true);
    return;
  }
  if (openingState === "offer") {
    addProposedMove(row, col);
    return;
  }
  const moverSeat = seatForColor(currentPlayer);
  placeStone(row, col, currentPlayer);
  if (finishTurn(row, col)) return;
  advanceAfterMove(moverSeat);
}

function handleCellIntent(event) {
  if (gameOver || computerThinking || openingState === "decision") return;
  const cell = event.currentTarget;
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  let problem;
  if (modeElement.value === "online") {
    problem = board[row][col] !== EMPTY ? "occupied" : onlineMoveProblem();
  } else {
    problem = openingState === "choose" && !isProposedMove(row, col) ? "proposalOnly" : validateMove(row, col, currentPlayer);
  }
  cell.classList.toggle("not-allowed", Boolean(problem));
  if (problem) showMoveError(problem, false);
  else if (statusMode === "intent") clearIntentStatus();
}

function clearCellIntent(event) {
  event.currentTarget.classList.remove("not-allowed");
  if (statusMode === "intent") clearIntentStatus();
}

function validateMove(row, col, player) {
  if (!isInside(row, col) || board[row][col] !== EMPTY) return "occupied";
  if (rulesElement.value !== "renju") return "";
  if (openingState === "choose") return isProposedMove(row, col) ? "" : "proposalOnly";
  if (openingState === "offer" && proposalMoves.some(move => symmetryKey(move.row, move.col) === symmetryKey(row, col))) return "symmetricProposal";
  const openingProblem = validateOpeningZone(row, col);
  if (openingProblem) return openingProblem;
  if (player !== BLACK) return "";

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

function validateOpeningZone(row, col) {
  if (openingState !== "move" || moveCount >= 5) return "";
  const radii = [0, 1, 2, 3, 4];
  const radius = radii[moveCount];
  if (Math.abs(row - CENTER) <= radius && Math.abs(col - CENTER) <= radius) return "";
  return "openingZone";
}

function advanceAfterMove(moverSeat, skipDecision = false) {
  currentPlayer = moveCount % 2 === 0 ? BLACK : WHITE;
  if (rulesElement.value === "renju" && moveCount <= 5 && !skipDecision) {
    beginOpeningDecision(moveCount, 3 - moverSeat);
    return;
  }
  openingState = "move";
  openingPanel.hidden = true;
  updateStatus();
  maybeStartComputerTurn();
}

function beginOpeningDecision(afterMove, seat) {
  openingState = "decision";
  decisionAfterMove = afterMove;
  decisionSeat = seat;
  updateOpeningPanel();
  updateStatus();
  if (isComputerSeat(seat)) {
    computerThinking = true;
    window.setTimeout(() => {
      computerThinking = false;
      const offer = afterMove === 4 && difficultyElement.value === "hard" && Math.random() < .25;
      resolveOpeningDecision(offer ? "offer" : "keep");
    }, 550);
  }
}

function resolveOpeningDecision(choice) {
  if (openingState !== "decision") return;
  if (choice === "swap") blackSeat = 3 - blackSeat;
  openingPanel.hidden = true;
  if (choice === "offer") {
    openingState = "offer";
    currentPlayer = BLACK;
    proposalMoves = [];
    updateStatus();
    if (isComputerSeat(seatForColor(BLACK))) computerOfferMoves();
    return;
  }
  openingState = "move";
  currentPlayer = moveCount % 2 === 0 ? BLACK : WHITE;
  updateStatus();
  maybeStartComputerTurn();
}

function updateOpeningPanel() {
  if (!openingPanel || openingState !== "decision") {
    if (openingPanel) openingPanel.hidden = true;
    return;
  }
  openingPanel.hidden = isComputerSeat(decisionSeat);
  offerTenButton.hidden = decisionAfterMove !== 4;
  const currentColor = colorForSeat(decisionSeat);
  const otherColor = currentColor === BLACK ? WHITE : BLACK;
  const player = modeElement.value === "local" ? t("playerLabel", { seat: decisionSeat }) : t("yourTurnColor", { color: playerName(currentColor) });
  openingMessage.textContent = t("openingDecision", { move: decisionAfterMove, player });
  keepColorsButton.textContent = t("continueAs", { color: playerName(currentColor) });
  swapColorsButton.textContent = t("takeOver", { color: playerName(otherColor) });
}

function addProposedMove(row, col) {
  proposalMoves.push({ row, col });
  getCell(row, col).classList.add("proposal");
  if (proposalMoves.length < 10) {
    updateStatus();
    return;
  }
  openingState = "choose";
  currentPlayer = WHITE;
  updateStatus();
  if (isComputerSeat(seatForColor(WHITE))) {
    computerThinking = true;
    window.setTimeout(() => {
      computerThinking = false;
      const selected = chooseProposalForComputer();
      chooseProposedMove(selected.row, selected.col);
    }, 550);
  }
}

function chooseProposedMove(row, col) {
  if (!isProposedMove(row, col)) {
    showMoveError("proposalOnly", true);
    return;
  }
  proposalMoves.forEach(move => getCell(move.row, move.col).classList.remove("proposal"));
  proposalMoves = [];
  placeStone(row, col, BLACK);
  openingState = "move";
  currentPlayer = WHITE;
  updateStatus();
  maybeStartComputerTurn();
}

function isProposedMove(row, col) {
  return proposalMoves.some(move => move.row === row && move.col === col);
}

function symmetryKey(row, col) {
  const x = row - CENTER;
  const y = col - CENTER;
  return [[x,y],[x,-y],[-x,y],[-x,-y],[y,x],[y,-x],[-y,x],[-y,-x]]
    .map(([a,b]) => `${a},${b}`).sort()[0];
}

function computerOfferMoves() {
  computerThinking = true;
  window.setTimeout(() => {
    const choices = [];
    const used = new Set();
    for (let row = 0; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        if (board[row][col] !== EMPTY) continue;
        const key = symmetryKey(row, col);
        if (used.has(key)) continue;
        used.add(key);
        choices.push({ row, col, score: scorePosition(row, col, BLACK) + Math.random() * 20 });
      }
    }
    choices.sort((a, b) => b.score - a.score);
    computerThinking = false;
    choices.slice(0, 10).forEach(move => addProposedMove(move.row, move.col));
  }, 550);
}

function chooseProposalForComputer() {
  if (difficultyElement.value === "easy") return randomChoice(proposalMoves);
  return [...proposalMoves].sort((a, b) => scorePosition(a.row, a.col, BLACK) - scorePosition(b.row, b.col, BLACK))[0];
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
    const player = currentPlayer;
    const moverSeat = seatForColor(player);
    const move = chooseComputerMove(difficultyElement.value);
    if (!move || gameOver) { computerThinking = false; return; }
    placeStone(move.row, move.col, player);
    computerThinking = false;
    if (finishTurn(move.row, move.col)) return;
    advanceAfterMove(moverSeat);
  }, 350);
}

function chooseComputerMove(difficulty) {
  const candidates = candidateMoves();
  if (!candidates.length) return { row: CENTER, col: CENTER };

  const winningMoves = candidates.filter(move => wouldWin(move.row, move.col, currentPlayer));
  if (winningMoves.length) return randomChoice(winningMoves);

  const opponent = currentPlayer === BLACK ? WHITE : BLACK;
  const blockingMoves = candidates.filter(move => isLegalMoveFor(move.row, move.col, opponent) && wouldWin(move.row, move.col, opponent));
  if (blockingMoves.length && (difficulty !== "easy" || Math.random() < 0.9)) return randomChoice(blockingMoves);

  const scored = candidates.map(move => {
    const attack = scorePosition(move.row, move.col, currentPlayer);
    const defence = scorePosition(move.row, move.col, opponent);
    const center = 7 - (Math.abs(move.row - CENTER) + Math.abs(move.col - CENTER)) * 0.08;
    const noise = difficulty === "easy" ? Math.random() * 18 : difficulty === "medium" ? Math.random() * 7 : Math.random() * 3;
    return { ...move, score: Math.max(attack * 1.12, defence) + attack * .15 + center + noise };
  });
  scored.sort((a, b) => b.score - a.score);
  if (difficulty === "easy") {
    const poolSize = Math.random() < .35 ? 8 : 3;
    return randomChoice(scored.slice(0, Math.min(poolSize, scored.length)));
  }
  if (difficulty === "medium") return randomChoice(scored.slice(0, Math.min(2, scored.length)));
  return scored[0];
}

function wouldWin(row, col, player) {
  if (board[row][col] !== EMPTY) return false;
  board[row][col] = player;
  const wins = DIRECTIONS.some(([dr, dc]) => {
    const length = lineLength(row, col, dr, dc, player);
    return rulesElement.value === "renju" && player === BLACK ? length === 5 : length >= 5;
  });
  board[row][col] = EMPTY;
  return wins;
}

function isLegalMoveFor(row, col, player) {
  return validateMove(row, col, player) === "";
}

function candidateMoves() {
  const candidates = [];
  let hasStone = false;
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col] !== EMPTY) { hasStone = true; continue; }
      if (validateMove(row, col, currentPlayer)) continue;
      let nearby = false;
      for (let dr = -2; dr <= 2 && !nearby; dr += 1) {
        for (let dc = -2; dc <= 2; dc += 1) {
          if (isInside(row + dr, col + dc) && board[row + dr][col + dc] !== EMPTY) { nearby = true; break; }
        }
      }
      if (nearby) candidates.push({ row, col });
    }
  }
  if (!hasStone) return [{ row: CENTER, col: CENTER }];
  if (candidates.length) return candidates;
  const fallback = [];
  for (let row = 0; row < SIZE; row += 1) for (let col = 0; col < SIZE; col += 1) if (!validateMove(row, col, currentPlayer)) fallback.push({ row, col });
  return fallback;
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

function showMoveError(messageKey, persistent) {
  window.clearTimeout(statusTimer);
  const values = messageKey === "openingZone"
    ? { move: moveCount + 1, size: moveCount * 2 + 1 }
    : {};
  statusElement.textContent = t(messageKey, values);
  statusElement.classList.add("error");
  statusMode = persistent ? "click" : "intent";
  if (persistent) statusTimer = window.setTimeout(clearIntentStatus, 2600);
}

function clearIntentStatus() {
  window.clearTimeout(statusTimer);
  statusMode = "normal";
  statusElement.classList.remove("error");
  updateStatus();
}

function showResult(winner) {
  document.querySelector("#dialog-title").textContent = winner ? t("wins", { player: playerName(winner) }) : t("draw");
  document.querySelector("#dialog-message").textContent = winner ? t("fiveInRow", { player: playerName(winner) }) : t("boardFull");
  const stone = document.querySelector("#winner-stone");
  stone.hidden = winner === EMPTY;
  stone.className = `winner-stone${winner === WHITE ? " white" : ""}`;
  dialogElement.hidden = false;
}

function showOnlineResult(state) {
  const winner = state.winner || EMPTY;
  document.querySelector("#dialog-title").textContent = winner
    ? t("wins", { player: playerName(winner) })
    : t("draw");
  document.querySelector("#dialog-message").textContent = state.endReason === "resigned" && state.resignedColor
    ? t("playerLeft", { player: playerName(state.resignedColor) })
    : winner ? t("fiveInRow", { player: playerName(winner) }) : t("boardFull");
  const stone = document.querySelector("#winner-stone");
  stone.hidden = winner === EMPTY;
  stone.className = `winner-stone${winner === WHITE ? " white" : ""}`;
  dialogElement.hidden = false;
}

function updateRuleHint() {
  if (modeElement.value === "online") {
    hintElement.textContent = t("onlineOnlyFree");
    return;
  }
  hintElement.textContent = rulesElement.value === "renju"
    ? t("renjuHint")
    : t("freeHint");
}

function updateStatus() {
  if (modeElement.value === "online") {
    updateOnlineStatus();
    return;
  }
  if (openingState === "offer") {
    statusElement.textContent = t("offerStatus", { count: proposalMoves.length + 1 });
    return;
  }
  if (openingState === "choose") {
    statusElement.textContent = t("chooseProposal");
    return;
  }
  if (openingState === "decision") {
    statusElement.textContent = isComputerSeat(decisionSeat) ? t("computerDecision") : t("openingDecision", {
      move: decisionAfterMove,
      player: modeElement.value === "local" ? t("playerLabel", { seat: decisionSeat }) : t("yourTurnColor", { color: playerName(colorForSeat(decisionSeat)) })
    });
    return;
  }
  if (rulesElement.value === "renju" && moveCount === 0) {
    statusElement.textContent = t("renjuStart");
  } else if (modeElement.value === "computer") {
    statusElement.textContent = seatForColor(currentPlayer) === 1
      ? t("yourTurnColor", { color: playerName(currentPlayer) })
      : t("computerTurnColor", { color: playerName(currentPlayer) });
  } else {
    statusElement.textContent = t("localTurn", { seat: seatForColor(currentPlayer), color: playerName(currentPlayer) });
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
function seatForColor(color) { return color === BLACK ? blackSeat : 3 - blackSeat; }
function colorForSeat(seat) { return seat === blackSeat ? BLACK : WHITE; }
function isComputerSeat(seat) { return modeElement.value === "computer" && seat === 2; }

function maybeStartComputerTurn() {
  if (!gameOver && openingState === "move" && isComputerSeat(seatForColor(currentPlayer))) computerMove();
}

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

function onlineMoveProblem() {
  if (!onlineSession || !onlineState || onlineState.status === "waiting") return "waitingForOpponent";
  if (onlineState.status !== "active") return "gameOver";
  if (onlineState.currentColor !== onlineState.yourColor) return "notYourTurn";
  return "";
}

async function onlineApi(functionName, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || t("onlineError"));
  return result;
}

function setOnlineBusy(busy) {
  onlineRequestPending = busy;
  document.querySelector("#create-online").disabled = busy;
  document.querySelector("#join-online").disabled = busy;
  if (busy) {
    statusElement.textContent = t("onlineBusy");
    statusElement.classList.remove("error");
  }
}

async function createOnlineGame() {
  if (onlineRequestPending) return;
  const name = onlineNameInput.value.trim();
  if (!name) { onlineNameInput.focus(); return; }
  localStorage.setItem("five-online-name", name);
  setOnlineBusy(true);
  try {
    const state = await onlineApi("create_online_game", { p_name: name });
    saveOnlineSession(state.code, state.token);
    applyOnlineState(state);
    scheduleOnlinePoll(500);
  } catch (error) {
    showOnlineError(error);
  } finally {
    setOnlineBusy(false);
  }
}

async function joinOnlineGame() {
  if (onlineRequestPending) return;
  const name = onlineNameInput.value.trim();
  const code = onlineCodeInput.value.trim().toUpperCase();
  if (!name) { onlineNameInput.focus(); return; }
  if (!/^[0-9A-F]{6}$/.test(code)) { showMoveError("invalidCode", true); onlineCodeInput.focus(); return; }
  localStorage.setItem("five-online-name", name);
  setOnlineBusy(true);
  try {
    const state = await onlineApi("join_online_game", { p_code: code, p_name: name });
    saveOnlineSession(state.code, state.token);
    applyOnlineState(state);
    scheduleOnlinePoll(500);
  } catch (error) {
    showOnlineError(error);
  } finally {
    setOnlineBusy(false);
  }
}

function saveOnlineSession(code, token) {
  onlineSession = { code, token };
  localStorage.setItem("five-online-session", JSON.stringify(onlineSession));
}

async function restoreOnlineSession() {
  const saved = localStorage.getItem("five-online-session");
  if (!saved) return;
  try {
    onlineSession = JSON.parse(saved);
    if (!onlineSession?.code || !onlineSession?.token) throw new Error();
    modeElement.value = "online";
    configureMode();
    const state = await onlineApi("online_state", { p_code: onlineSession.code, p_token: onlineSession.token });
    applyOnlineState(state);
    scheduleOnlinePoll(700);
  } catch {
    clearOnlineSession();
    configureMode();
  }
}

function applyOnlineState(state) {
  const previousStatus = onlineState?.status;
  const previousMoves = onlineState?.moves?.length ?? -1;
  onlineState = state;
  onlineLobby.hidden = true;
  onlineRoom.hidden = false;
  roomCodeButton.textContent = state.code;
  onlinePlayers.textContent = t("onlinePlayers", {
    black: state.hostName,
    white: state.guestName || "…"
  });

  if (previousMoves !== state.moves.length || previousStatus !== state.status || !board) {
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
    currentPlayer = state.currentColor;
    gameOver = state.status === "finished";
    computerThinking = false;
    moveCount = 0;
    lastMove = null;
    openingState = "move";
    dialogElement.hidden = true;
    renderBoard();
    state.moves.forEach(move => placeStone(move.row, move.col, move.color));
    if (state.status === "finished" && state.winner && state.moves.length) {
      const finalMove = state.moves[state.moves.length - 1];
      findWinningLine(finalMove.row, finalMove.col).forEach(([row, col]) => getCell(row, col).classList.add("winning"));
    }
  } else {
    currentPlayer = state.currentColor;
    gameOver = state.status === "finished";
  }
  updateStatus();
  updateRuleHint();

  if (state.status === "finished" && !onlineResultShown) {
    onlineResultShown = true;
    window.setTimeout(() => showOnlineResult(state), 120);
  }
}

async function playOnlineMove(row, col) {
  const problem = board[row][col] !== EMPTY ? "occupied" : onlineMoveProblem();
  if (problem) { showMoveError(problem, true); return; }
  if (onlineRequestPending) return;
  onlineRequestPending = true;
  try {
    const state = await onlineApi("play_online_move", {
      p_code: onlineSession.code,
      p_token: onlineSession.token,
      p_row: row,
      p_col: col
    });
    applyOnlineState(state);
  } catch (error) {
    showOnlineError(error);
    await pollOnlineState();
  } finally {
    onlineRequestPending = false;
  }
}

function scheduleOnlinePoll(delay = 1200) {
  window.clearTimeout(onlinePollTimer);
  if (modeElement.value === "online" && onlineSession) {
    onlinePollTimer = window.setTimeout(pollOnlineState, delay);
  }
}

async function pollOnlineState() {
  if (!onlineSession || modeElement.value !== "online") return;
  try {
    const state = await onlineApi("online_state", { p_code: onlineSession.code, p_token: onlineSession.token });
    applyOnlineState(state);
  } catch (error) {
    if (!navigator.onLine) showOnlineError(error);
  } finally {
    scheduleOnlinePoll();
  }
}

async function leaveOnlineGame() {
  const session = onlineSession;
  const shouldResign = onlineState?.status === "active";
  clearOnlineSession();
  configureMode();
  resetGame();
  if (session && shouldResign) {
    onlineApi("resign_online_game", { p_code: session.code, p_token: session.token }).catch(() => {});
  }
}

function clearOnlineSession() {
  window.clearTimeout(onlinePollTimer);
  onlineSession = null;
  onlineState = null;
  onlineResultShown = false;
  localStorage.removeItem("five-online-session");
}

function showOnlineError(error) {
  const knownMessage = /inte din tur/i.test(error.message) ? t("notYourTurn")
    : /upptagen/i.test(error.message) ? t("occupied")
    : error.message || t("onlineError");
  window.clearTimeout(statusTimer);
  statusElement.textContent = knownMessage;
  statusElement.classList.add("error");
  statusMode = "click";
  statusTimer = window.setTimeout(clearIntentStatus, 3200);
}

function updateOnlineStatus() {
  statusElement.classList.remove("error");
  if (!onlineState) {
    statusElement.textContent = t("onlineOnlyFree");
    return;
  }
  if (onlineState.status === "waiting") {
    statusElement.textContent = t("onlineWaiting", { code: onlineState.code });
    return;
  }
  if (onlineState.status === "finished") {
    statusElement.textContent = onlineState.winner
      ? t("wins", { player: playerName(onlineState.winner) })
      : t("draw");
    return;
  }
  const yourColor = playerName(onlineState.yourColor);
  if (onlineState.currentColor === onlineState.yourColor) {
    statusElement.textContent = t("onlineYourTurn", { color: yourColor });
  } else {
    const opponentName = onlineState.yourColor === BLACK ? onlineState.guestName : onlineState.hostName;
    statusElement.textContent = t("onlineOpponentTurn", { name: opponentName, color: yourColor });
  }
}

function configureMode() {
  const isOnline = modeElement.value === "online";
  difficultyField.hidden = modeElement.value !== "computer";
  onlinePanel.hidden = !isOnline;
  rulesElement.disabled = isOnline;
  document.querySelector("#new-game").hidden = isOnline;
  if (isOnline) {
    rulesElement.value = "free";
    onlineLobby.hidden = Boolean(onlineSession);
    onlineRoom.hidden = !onlineSession;
    if (onlineSession) scheduleOnlinePoll(100);
  } else {
    window.clearTimeout(onlinePollTimer);
  }
  updateRuleHint();
  updateStatus();
}

document.querySelector("#new-game").addEventListener("click", resetGame);
document.querySelector("#play-again").addEventListener("click", () => {
  if (modeElement.value === "online") dialogElement.hidden = true;
  else resetGame();
});
keepColorsButton.addEventListener("click", () => resolveOpeningDecision("keep"));
swapColorsButton.addEventListener("click", () => resolveOpeningDecision("swap"));
offerTenButton.addEventListener("click", () => resolveOpeningDecision("offer"));
document.querySelector("#create-online").addEventListener("click", createOnlineGame);
document.querySelector("#join-online").addEventListener("click", joinOnlineGame);
document.querySelector("#leave-online").addEventListener("click", leaveOnlineGame);
roomCodeButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(roomCodeButton.textContent);
    showMoveError("copied", true);
  } catch { /* The visible code can still be selected manually. */ }
});
onlineCodeInput.addEventListener("input", () => {
  onlineCodeInput.value = onlineCodeInput.value.toUpperCase().replace(/[^0-9A-F]/g, "").slice(0, 6);
});
onlineCodeInput.addEventListener("keydown", event => { if (event.key === "Enter") joinOnlineGame(); });
modeElement.addEventListener("change", () => {
  scores = { black: 0, white: 0, draw: 0 };
  updateScore();
  resetGame();
  configureMode();
});
rulesElement.addEventListener("change", () => { scores = { black: 0, white: 0, draw: 0 }; updateScore(); resetGame(); });
difficultyElement.addEventListener("change", resetGame);
languageElement.addEventListener("change", () => {
  language = languageElement.value;
  localStorage.setItem("five-language", language);
  applyLanguage();
});

languageElement.value = language;
onlineNameInput.value = localStorage.getItem("five-online-name") || "";
resetGame();
applyLanguage();
configureMode();
restoreOnlineSession();

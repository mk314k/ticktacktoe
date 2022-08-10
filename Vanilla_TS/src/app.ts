import { AiDifficulty, ZeroCrossEngine } from "./zeroCross";

export function mountVanillaTsApp(root: HTMLElement): void {
  let boardSize = 3;
  let engine = new ZeroCrossEngine(boardSize, "O");
  let vsComputer = true;
  let difficulty: AiDifficulty = "unbeatable";
  const scores = { O: 0, X: 0, DRAW: 0 };

  root.innerHTML = `
    <div class="ts-shell">
      <header class="ts-header">
        <h1>ZeroCross TS</h1>
        <p id="ts-status"></p>
      </header>
      <div id="ts-board" class="ts-board"></div>
      <footer class="ts-controls">
        <button id="ts-size-btn" type="button">Grid: 3x3</button>
        <button id="ts-mode-btn" type="button">vs Computer</button>
        <button id="ts-undo-btn" type="button">Undo</button>
        <button id="ts-reset-btn" type="button">Reset</button>
      </footer>
    </div>
  `;

  const boardEl = root.querySelector<HTMLDivElement>("#ts-board")!;
  const statusEl = root.querySelector<HTMLParagraphElement>("#ts-status")!;
  const sizeBtn = root.querySelector<HTMLButtonElement>("#ts-size-btn")!;
  const modeBtn = root.querySelector<HTMLButtonElement>("#ts-mode-btn")!;
  const undoBtn = root.querySelector<HTMLButtonElement>("#ts-undo-btn")!;
  const resetBtn = root.querySelector<HTMLButtonElement>("#ts-reset-btn")!;

  function render(): void {
    boardEl.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    boardEl.innerHTML = "";
    const winSet = new Set(engine.winningLine() ?? []);
    engine.getBoard().forEach((cellVal, idx) => {
      const btn = document.createElement("button");
      btn.className = "ts-cell";
      if (winSet.has(idx)) btn.classList.add("ts-cell-win");
      btn.textContent = cellVal;
      btn.addEventListener("click", () => handleMove(idx));
      boardEl.appendChild(btn);
    });

    const outcome = engine.gameState();
    if (outcome === "DRAW") {
      statusEl.textContent = `Draw! (O: ${scores.O} | X: ${scores.X} | D: ${scores.DRAW})`;
    } else if (outcome !== null) {
      statusEl.textContent = `${outcome} Wins! (O: ${scores.O} | X: ${scores.X} | D: ${scores.DRAW})`;
    } else {
      statusEl.textContent = `Turn: ${engine.whoseChance()} | O: ${scores.O} · X: ${scores.X} · D: ${scores.DRAW}`;
    }
  }

  function handleMove(index: number): void {
    if (engine.gameState() !== null) return;
    if (vsComputer && engine.whoseChance() === "X") return;
    if (!engine.makeMove(index)) return;

    const afterHuman = engine.gameState();
    if (afterHuman !== null) {
      scores[afterHuman]++;
      render();
      return;
    }
    render();

    if (vsComputer && engine.whoseChance() === "X") {
      const aiMove = engine.computeBestMove(difficulty);
      if (aiMove !== null) {
        engine.makeMove(aiMove);
        const afterAi = engine.gameState();
        if (afterAi !== null) scores[afterAi]++;
      }
      render();
    }
  }

  sizeBtn.addEventListener("click", () => {
    boardSize = boardSize === 3 ? 4 : 3;
    sizeBtn.textContent = `Grid: ${boardSize}x${boardSize}`;
    engine = new ZeroCrossEngine(boardSize, "O");
    render();
  });

  modeBtn.addEventListener("click", () => {
    vsComputer = !vsComputer;
    modeBtn.textContent = vsComputer ? "vs Computer" : "2 Players";
    engine.reset("O");
    render();
  });

  undoBtn.addEventListener("click", () => {
    engine.undo();
    if (vsComputer && engine.whoseChance() === "X") {
      engine.undo();
    }
    render();
  });

  resetBtn.addEventListener("click", () => {
    engine.reset("O");
    render();
  });

  render();
}

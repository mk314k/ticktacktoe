export type SymbolMark = "O" | "X";
export type CellValue = SymbolMark | "";
export type GameOutcome = SymbolMark | "DRAW" | null;
export type AiDifficulty = "unbeatable" | "tactical" | "casual";

export interface MoveRecord {
  index: number;
  symbol: SymbolMark;
}

export class ZeroCrossEngine {
  readonly boardSize: number;
  private board: CellValue[];
  private turn: SymbolMark;
  private outcome: GameOutcome = null;
  private winIndices: number[] | null = null;
  private history: MoveRecord[] = [];
  private readonly lines: number[][];

  constructor(boardSize: number = 3, firstTurn: SymbolMark = "O") {
    this.boardSize = boardSize;
    this.board = Array<CellValue>(boardSize * boardSize).fill("");
    this.turn = firstTurn;
    this.lines = this.buildWinningLines(boardSize);
  }

  private buildWinningLines(n: number): number[][] {
    const lines: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      const col: number[] = [];
      for (let j = 0; j < n; j++) {
        row.push(i * n + j);
        col.push(j * n + i);
      }
      lines.push(row, col);
    }
    const diag1: number[] = [];
    const diag2: number[] = [];
    for (let i = 0; i < n; i++) {
      diag1.push(i * (n + 1));
      diag2.push((i + 1) * (n - 1));
    }
    lines.push(diag1, diag2);
    return lines;
  }

  reset(firstTurn: SymbolMark = "O"): void {
    this.board = Array<CellValue>(this.boardSize * this.boardSize).fill("");
    this.turn = firstTurn;
    this.outcome = null;
    this.winIndices = null;
    this.history = [];
  }

  whoseChance(): SymbolMark {
    return this.turn;
  }

  gameState(): GameOutcome {
    return this.outcome;
  }

  winningLine(): number[] | null {
    return this.winIndices ? [...this.winIndices] : null;
  }

  getBoard(): ReadonlyArray<CellValue> {
    return this.board;
  }

  moveCount(): number {
    return this.history.length;
  }

  makeMove(index: number): boolean {
    if (this.outcome !== null || index < 0 || index >= this.board.length) {
      return false;
    }
    if (this.board[index] !== "") {
      return false;
    }
    this.history.push({ index, symbol: this.turn });
    this.board[index] = this.turn;
    const check = this.evaluateBoard(this.board);
    this.outcome = check.outcome;
    this.winIndices = check.line;
    if (this.outcome === null) {
      this.turn = this.turn === "O" ? "X" : "O";
    }
    return true;
  }

  undo(): boolean {
    const last = this.history.pop();
    if (!last) return false;
    this.board[last.index] = "";
    this.turn = last.symbol;
    this.outcome = null;
    this.winIndices = null;
    return true;
  }

  private evaluateBoard(board: CellValue[]): {
    outcome: GameOutcome;
    line: number[] | null;
  } {
    for (const line of this.lines) {
      const first = board[line[0]];
      if (first !== "" && line.every((idx) => board[idx] === first)) {
        return { outcome: first, line };
      }
    }
    if (board.every((c) => c !== "")) {
      return { outcome: "DRAW", line: null };
    }
    return { outcome: null, line: null };
  }

  computeBestMove(difficulty: AiDifficulty = "unbeatable"): number | null {
    if (this.outcome !== null) return null;
    const empty: number[] = [];
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i] === "") empty.push(i);
    }
    if (empty.length === 0) return null;

    if (difficulty === "casual" && Math.random() < 0.45) {
      return empty[Math.floor(Math.random() * empty.length)];
    }
    if (difficulty === "tactical" && Math.random() < 0.2) {
      return empty[Math.floor(Math.random() * empty.length)];
    }

    const n = this.boardSize;
    if (empty.length === n * n) {
      const center = Math.floor((n * n) / 2);
      return empty.includes(center) ? center : 0;
    }

    const ai: SymbolMark = this.turn;
    const human: SymbolMark = ai === "O" ? "X" : "O";
    const maxDepth = n === 3 ? 9 : 4;
    const scratch = [...this.board];

    const minimax = (
      depth: number,
      isMax: boolean,
      alpha: number,
      beta: number
    ): number => {
      const res = this.evaluateBoard(scratch);
      if (res.outcome === ai) return 100 - depth;
      if (res.outcome === human) return depth - 100;
      if (res.outcome === "DRAW" || depth >= maxDepth) return 0;

      if (isMax) {
        let best = -1000;
        for (let i = 0; i < scratch.length; i++) {
          if (scratch[i] !== "") continue;
          scratch[i] = ai;
          best = Math.max(best, minimax(depth + 1, false, alpha, beta));
          scratch[i] = "";
          alpha = Math.max(alpha, best);
          if (beta <= alpha) break;
        }
        return best;
      } else {
        let best = 1000;
        for (let i = 0; i < scratch.length; i++) {
          if (scratch[i] !== "") continue;
          scratch[i] = human;
          best = Math.min(best, minimax(depth + 1, true, alpha, beta));
          scratch[i] = "";
          beta = Math.min(beta, best);
          if (beta <= alpha) break;
        }
        return best;
      }
    };

    let bestMove = empty[0];
    let bestScore = -1000;
    for (const idx of empty) {
      scratch[idx] = ai;
      const score = minimax(0, false, -1000, 1000);
      scratch[idx] = "";
      if (score > bestScore) {
        bestScore = score;
        bestMove = idx;
      }
    }
    return bestMove;
  }
}

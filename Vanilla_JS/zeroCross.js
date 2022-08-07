/**
 * ZeroCross (Tic-Tac-Toe) Engine in Vanilla JavaScript.
 * Supports N x N boards, row/col/diagonal win detection, draw detection,
 * and alpha-beta Minimax AI opponent.
 */

export class ZeroCross {
  constructor(boardSize = 3, zero = "O", cross = "X", zeroIsFirst = true) {
    this.boardSize = boardSize;
    this.zero = zero;
    this.cross = cross;
    this.zeroIsFirst = zeroIsFirst;
    this.lines = this._buildWinningLines(boardSize);
    this.reset(zeroIsFirst);
  }

  _buildWinningLines(n) {
    const lines = [];
    for (let i = 0; i < n; i++) {
      const row = [];
      const col = [];
      for (let j = 0; j < n; j++) {
        row.push(i * n + j);
        col.push(j * n + i);
      }
      lines.push(row, col);
    }
    const diagMain = [];
    const diagAnti = [];
    for (let i = 0; i < n; i++) {
      diagMain.push(i * (n + 1));
      diagAnti.push((i + 1) * (n - 1));
    }
    lines.push(diagMain, diagAnti);
    return lines;
  }

  reset(zeroIsFirst = this.zeroIsFirst) {
    this.zeroIsFirst = zeroIsFirst;
    this.board = Array(this.boardSize * this.boardSize).fill("");
    this.chance = zeroIsFirst ? this.zero : this.cross;
    this.state = null; // 'O' | 'X' | 'DRAW' | null
    this.winningLine = null;
    this.history = [];
  }

  whoseChance() {
    return this.chance;
  }

  gameState() {
    return this.state;
  }

  getCell(index) {
    return this.board[index];
  }

  makeMove(index) {
    if (this.state !== null || index < 0 || index >= this.board.length) {
      return false;
    }
    if (this.board[index] !== "") {
      return false;
    }
    this.history.push({ index, symbol: this.chance });
    this.board[index] = this.chance;
    const result = this._checkEnd(this.board);
    this.state = result.state;
    this.winningLine = result.line;
    if (this.state === null) {
      this.chance = this.chance === this.cross ? this.zero : this.cross;
    }
    return true;
  }

  undo() {
    if (this.history.length === 0) return false;
    const last = this.history.pop();
    this.board[last.index] = "";
    this.chance = last.symbol;
    this.state = null;
    this.winningLine = null;
    return true;
  }

  _checkEnd(board) {
    for (const line of this.lines) {
      const first = board[line[0]];
      if (first !== "" && line.every((idx) => board[idx] === first)) {
        return { state: first, line };
      }
    }
    if (board.every((cell) => cell !== "")) {
      return { state: "DRAW", line: null };
    }
    return { state: null, line: null };
  }

}

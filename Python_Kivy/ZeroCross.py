from typing import List, Optional, Tuple


class ZeroCross:
    """N x N Zero-Cross (Tic-Tac-Toe) game engine with Minimax AI."""

    def __init__(
        self,
        boardSize: int = 3,
        zero: str = "O",
        cross: str = "X",
        zeroIsFirst: bool = True,
    ) -> None:
        self.__boardSize = boardSize
        self.__board = [""] * (boardSize**2)
        self.__zero = zero
        self.__cross = cross
        self.__allowedSymbols = {zero, cross}
        self.__zeroIsFirst = zeroIsFirst
        self.__chance = zero if zeroIsFirst else cross
        self.__gameState: Optional[str] = None
        self.__winningLine: Optional[List[int]] = None
        self.checkRep()

    def checkRep(self) -> None:
        assert isinstance(self.__boardSize, int), "boardSize must be an integer"
        assert self.__boardSize >= 3, "boardSize must be at least 3"
        assert len(self.__board) == self.__boardSize**2
        assert self.__zero != self.__cross and self.__zero != "" and self.__cross != ""

    @property
    def boardSize(self) -> int:
        return self.__boardSize

    @property
    def zeroSymbol(self) -> str:
        return self.__zero

    @property
    def crossSymbol(self) -> str:
        return self.__cross

    def reset(self, zeroIsFirst: Optional[bool] = None) -> None:
        if zeroIsFirst is not None:
            self.__zeroIsFirst = zeroIsFirst
        self.__board = [""] * (self.__boardSize**2)
        self.__chance = self.__zero if self.__zeroIsFirst else self.__cross
        self.__gameState = None
        self.__winningLine = None
        self.checkRep()

    def whoseChance(self) -> str:
        return self.__chance

    def __getitem__(self, index: int) -> str:
        assert (
            isinstance(index, int) and 0 <= index < self.__boardSize**2
        ), f"Index {index} out of bounds"
        return self.__board[index]

    def __setitem__(self, index: int, value: str) -> None:
        assert (
            isinstance(index, int) and 0 <= index < self.__boardSize**2
        ), f"Index {index} out of bounds"
        assert value in self.__allowedSymbols, f"Invalid symbol: {value}"
        assert self.__board[index] == "", f"Cell {index} is already occupied"
        assert self.__gameState is None, "Game has already ended"

        self.__board[index] = value
        self.__gameState, self.__winningLine = self.__checkEnd()
        if self.__gameState is None:
            self.__chance = (
                self.__zero if self.__chance == self.__cross else self.__cross
            )
        self.checkRep()

    def gameState(self) -> Optional[str]:
        """Returns winner symbol ('O' or 'X'), 'DRAW', or None if ongoing."""
        return self.__gameState

    def winningLine(self) -> Optional[List[int]]:
        """Returns the list of board indices forming the winning line, if any."""
        return list(self.__winningLine) if self.__winningLine is not None else None

    def availableMoves(self) -> List[int]:
        return [i for i, cell in enumerate(self.__board) if cell == ""]

    def __iterWinningLines(self) -> List[List[int]]:
        n = self.__boardSize
        lines: List[List[int]] = []
        for i in range(n):
            lines.append([i * n + j for j in range(n)])
            lines.append([j * n + i for j in range(n)])
        lines.append([i * (n + 1) for i in range(n)])
        lines.append([(i + 1) * (n - 1) for i in range(n)])
        return lines

    def __checkEnd(self) -> Tuple[Optional[str], Optional[List[int]]]:
        for line in self.__iterWinningLines():
            first = self.__board[line[0]]
            if first != "" and all(self.__board[idx] == first for idx in line):
                return first, line
        if all(cell != "" for cell in self.__board):
            return "DRAW", None
        return None, None

    def computeBestMove(self, maxDepth: int = 6) -> Optional[int]:
        """Compute the optimal move index for the current player using alpha-beta Minimax."""
        if self.__gameState is not None:
            return None
        moves = self.availableMoves()
        if not moves:
            return None

        aiPlayer = self.__chance
        humanPlayer = self.__zero if aiPlayer == self.__cross else self.__cross
        n = self.__boardSize

        # If board is completely empty, prefer center or corner immediately
        if len(moves) == n * n:
            center = (n * n) // 2
            return center if center in moves else 0

        lines = self.__iterWinningLines()

        def evaluate(board: List[str], depth: int) -> int:
            for line in lines:
                first = board[line[0]]
                if first != "" and all(board[idx] == first for idx in line):
                    return (100 - depth) if first == aiPlayer else (depth - 100)
            return 0

        def minimax(
            board: List[str], depth: int, isMaximizing: bool, alpha: int, beta: int
        ) -> int:
            score = evaluate(board, depth)
            if score != 0:
                return score
            empty = [i for i, c in enumerate(board) if c == ""]
            if not empty or depth >= maxDepth:
                return 0

            if isMaximizing:
                best = -1000
                for idx in empty:
                    board[idx] = aiPlayer
                    best = max(
                        best, minimax(board, depth + 1, False, alpha, beta)
                    )
                    board[idx] = ""
                    alpha = max(alpha, best)
                    if beta <= alpha:
                        break
                return best
            else:
                best = 1000
                for idx in empty:
                    board[idx] = humanPlayer
                    best = min(
                        best, minimax(board, depth + 1, True, alpha, beta)
                    )
                    board[idx] = ""
                    beta = min(beta, best)
                    if beta <= alpha:
                        break
                return best

        bestMove = moves[0]
        bestScore = -1000
        boardCopy = list(self.__board)
        for idx in moves:
            boardCopy[idx] = aiPlayer
            moveScore = minimax(boardCopy, 0, False, -1000, 1000)
            boardCopy[idx] = ""
            if moveScore > bestScore:
                bestScore = moveScore
                bestMove = idx
        return bestMove

    def __str__(self) -> str:
        return str(self.__board)

    def __repr__(self) -> str:
        return self.__str__()

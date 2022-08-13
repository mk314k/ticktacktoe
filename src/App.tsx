import React, { useEffect, useRef, useState } from "react";
import {
  AiDifficulty,
  CellValue,
  GameOutcome,
  SymbolMark,
  ZeroCrossEngine,
} from "./gameEngine";
import "./App.css";

interface ScoreBook {
  O: number;
  X: number;
  DRAW: number;
}

const STORAGE_KEY = "zerocross_scores_v1";

function loadScores(): ScoreBook {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        O: Number(parsed.O) || 0,
        X: Number(parsed.X) || 0,
        DRAW: Number(parsed.DRAW) || 0,
      };
    }
  } catch {
    // ignore storage errors
  }
  return { O: 0, X: 0, DRAW: 0 };
}

export function App(): React.ReactElement {
  const [boardSize, setBoardSize] = useState<number>(3);
  const [vsComputer, setVsComputer] = useState<boolean>(true);
  const [difficulty, setDifficulty] = useState<AiDifficulty>("unbeatable");
  const [humanMark, setHumanMark] = useState<SymbolMark>("O");
  const engineRef = useRef<ZeroCrossEngine>(new ZeroCrossEngine(3, "O"));

  const [board, setBoard] = useState<CellValue[]>(() => [
    ...engineRef.current.getBoard(),
  ]);
  const [turn, setTurn] = useState<SymbolMark>(() =>
    engineRef.current.whoseChance()
  );
  const [outcome, setOutcome] = useState<GameOutcome>(() =>
    engineRef.current.gameState()
  );
  const [winLine, setWinLine] = useState<number[] | null>(() =>
    engineRef.current.winningLine()
  );
  const [scores, setScores] = useState<ScoreBook>(loadScores);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  const aiMark: SymbolMark = humanMark === "O" ? "X" : "O";

  const syncFromEngine = (recordWin: boolean = false) => {
    const eng = engineRef.current;
    setBoard([...eng.getBoard()]);
    setTurn(eng.whoseChance());
    const state = eng.gameState();
    setOutcome(state);
    setWinLine(eng.winningLine());

    if (recordWin && state !== null) {
      setScores((prev) => {
        const next = { ...prev, [state]: prev[state] + 1 };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  };

  const handleCellClick = (index: number) => {
    if (outcome !== null || isAiThinking) return;
    if (vsComputer && turn === aiMark) return;

    const eng = engineRef.current;
    if (eng.makeMove(index)) {
      syncFromEngine(true);
    }
  };

  const handleNewRound = (nextSize: number = boardSize, first: SymbolMark = "O") => {
    setIsAiThinking(false);
    engineRef.current = new ZeroCrossEngine(nextSize, first);
    syncFromEngine(false);
  };

  const handleUndo = () => {
    if (isAiThinking) return;
    const eng = engineRef.current;
    if (!eng.undo()) return;
    if (vsComputer && eng.whoseChance() === aiMark) {
      eng.undo();
    }
    syncFromEngine(false);
  };

  const handleSizeToggle = (size: number) => {
    if (size === boardSize) return;
    setBoardSize(size);
    handleNewRound(size, "O");
  };

  const handleResetScores = () => {
    const zeroed = { O: 0, X: 0, DRAW: 0 };
    setScores(zeroed);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(zeroed));
    } catch {
      // ignore
    }
  };

  const winSet = new Set(winLine ?? []);

  return (
    <div className="ttt-page">
      <div className="ttt-card">
        <header className="ttt-header">
          <div className="ttt-title-group">
            <span className="ttt-eyebrow">ZeroCross Studio</span>
            <h1 className="ttt-title">Tick Tack Toe</h1>
          </div>
          <div className="ttt-size-pills" role="group" aria-label="Board Size">
            <button
              type="button"
              className={`pill-btn ${boardSize === 3 ? "active" : ""}`}
              onClick={() => handleSizeToggle(3)}
            >
              3×3
            </button>
            <button
              type="button"
              className={`pill-btn ${boardSize === 4 ? "active" : ""}`}
              onClick={() => handleSizeToggle(4)}
            >
              4×4
            </button>
          </div>
        </header>

        <section className="ttt-toolbar" aria-label="Game Settings">
          <div className="segment-group">
            <button
              type="button"
              className={`seg-btn ${vsComputer ? "active" : ""}`}
              onClick={() => {
                setVsComputer(true);
                handleNewRound(boardSize, "O");
              }}
            >
              vs Computer
            </button>
            <button
              type="button"
              className={`seg-btn ${!vsComputer ? "active" : ""}`}
              onClick={() => {
                setVsComputer(false);
                handleNewRound(boardSize, "O");
              }}
            >
              2 Players
            </button>
          </div>

          {vsComputer && (
            <div className="segment-group">
              {(["unbeatable", "tactical", "casual"] as AiDifficulty[]).map(
                (lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className={`seg-btn cap ${difficulty === lvl ? "active" : ""}`}
                    onClick={() => {
                      setDifficulty(lvl);
                      handleNewRound(boardSize, "O");
                    }}
                  >
                    {lvl}
                  </button>
                )
              )}
            </div>
          )}
        </section>

        <section className="ttt-scoreboard" aria-label="Scoreboard">
          <div
            className={`score-tile mark-o ${
              outcome === null && turn === "O" ? "active-turn" : ""
            }`}
          >
            <span className="score-label">
              O {vsComputer ? (humanMark === "O" ? "(You)" : "(AI)") : "(P1)"}
            </span>
            <strong className="score-value">{scores.O}</strong>
          </div>
          <div className="score-tile draws">
            <span className="score-label">Draws</span>
            <strong className="score-value">{scores.DRAW}</strong>
          </div>
          <div
            className={`score-tile mark-x ${
              outcome === null && turn === "X" ? "active-turn" : ""
            }`}
          >
            <span className="score-label">
              X {vsComputer ? (humanMark === "X" ? "(You)" : "(AI)") : "(P2)"}
            </span>
            <strong className="score-value">{scores.X}</strong>
          </div>
        </section>

        <div className="ttt-status-banner" role="status" aria-live="polite">
          {outcome === "DRAW" ? (
            <span className="banner-draw">Round tied — nobody yields!</span>
          ) : outcome !== null ? (
            <span className={`banner-win win-${outcome.toLowerCase()}`}>
              Player {outcome}{" "}
              {vsComputer ? (outcome === humanMark ? "(You)" : "(AI)") : ""}{" "}
              wins the round!
            </span>
          ) : (
            <span className="banner-turn">
              Turn: <strong>{turn}</strong>{" "}
              {vsComputer
                ? turn === humanMark
                  ? "— Your move"
                  : "— AI thinking..."
                : "— Place mark"}
            </span>
          )}
        </div>

        <section
          className={`ttt-board grid-${boardSize}`}
          aria-label="Tic Tac Toe Grid"
        >
          {board.map((cell, idx) => {
            const isWin = winSet.has(idx);
            return (
              <button
                key={idx}
                type="button"
                className={`ttt-cell ${
                  cell === "O" ? "mark-o" : cell === "X" ? "mark-x" : ""
                } ${isWin ? "winning-cell" : ""}`}
                onClick={() => handleCellClick(idx)}
                disabled={cell !== "" || outcome !== null}
                aria-label={`Cell ${idx + 1}, ${cell || "empty"}`}
              >
                {cell === "O" && (
                  <svg viewBox="0 0 100 100" className="glyph glyph-o">
                    <circle
                      cx="50"
                      cy="50"
                      r="32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {cell === "X" && (
                  <svg viewBox="0 0 100 100" className="glyph glyph-x">
                    <line
                      x1="24"
                      y1="24"
                      x2="76"
                      y2="76"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <line
                      x1="76"
                      y1="24"
                      x2="24"
                      y2="76"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </section>

        <footer className="ttt-footer">
          {vsComputer && (
            <button
              type="button"
              className="action-btn secondary"
              onClick={() => {
                const nextMark: SymbolMark = humanMark === "O" ? "X" : "O";
                setHumanMark(nextMark);
                handleNewRound(boardSize, "O");
              }}
            >
              Play as {humanMark === "O" ? "X (2nd)" : "O (1st)"}
            </button>
          )}
          <button
            type="button"
            className="action-btn secondary"
            onClick={handleUndo}
            disabled={engineRef.current.moveCount() === 0 || isAiThinking}
          >
            Undo
          </button>
          <button
            type="button"
            className="action-btn secondary"
            onClick={handleResetScores}
          >
            Zero Scores
          </button>
          <button
            type="button"
            className="action-btn primary"
            onClick={() => handleNewRound(boardSize, "O")}
          >
            New Round
          </button>
        </footer>
      </div>
    </div>
  );
}

export default App;

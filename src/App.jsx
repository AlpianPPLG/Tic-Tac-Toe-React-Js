import "./index.css";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

function Square({ value, onSquareClick, isWinningSquare }) {
  return (
    <button
      className={`square ${isWinningSquare ? "winning-square" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

Square.propTypes = {
  value: PropTypes.string,
  onSquareClick: PropTypes.func.isRequired,
  isWinningSquare: PropTypes.bool,
};

function Board({ xIsNext, squares, onPlay, timer }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i] || timer === 0) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner.winner;
  } else if (squares.every((sq) => sq !== null)) {
    status = "It's a draw!";
  } else if (timer === 0) {
    status = `Time's up! ${xIsNext ? "O" : "X"} wins by timeout.`;
  } else {
    status = `Next player: ${xIsNext ? "X" : "O"} (Time: ${timer}s)`;
  }

  function renderSquare(i) {
    const isWinningSquare = winner ? winner.line.includes(i) : false;
    return (
      <Square
        value={squares[i]}
        onSquareClick={() => handleClick(i)}
        isWinningSquare={isWinningSquare}
      />
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </>
  );
}

Board.propTypes = {
  xIsNext: PropTypes.bool.isRequired,
  squares: PropTypes.arrayOf(PropTypes.string),
  onPlay: PropTypes.func.isRequired,
  timer: PropTypes.number.isRequired,
};

function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [theme, setTheme] = useState("light");
  const [timer, setTimer] = useState(10);
  const [customTime, setCustomTime] = useState(10);
  const [showSettings, setShowSettings] = useState(false);
  const [firstPlayer, setFirstPlayer] = useState("X");
  const [undoLimit] = useState(3);
  const [undoCount, setUndoCount] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const xIsNext =
    currentMove % 2 === 0 ? firstPlayer === "X" : firstPlayer === "O";
  const currentSquares = history[currentMove];

  useEffect(() => {
    if (timer === 0) {
      handlePlay(currentSquares.map((sq) => (sq === null ? " " : sq)));
      return;
    }

    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, currentSquares]);

  function handlePlay(nextSquares) {
    const winner = calculateWinner(nextSquares);
    if (winner) {
      setScores((prevScores) => ({
        ...prevScores,
        [winner.winner]: prevScores[winner.winner] + 1,
      }));
    } else if (nextSquares.every((sq) => sq !== null)) {
      setScores((prevScores) => ({
        ...prevScores,
        draws: prevScores.draws + 1,
      }));
    }

    setHistory([...history.slice(0, currentMove + 1), nextSquares]);
    setCurrentMove(history.length);
    setTimer(customTime);
    setUndoCount(0);
  }

  function undoMove() {
    if (currentMove > 0 && undoCount < undoLimit) {
      setCurrentMove(currentMove - 1);
      setTimer(customTime);
      setUndoCount(undoCount + 1);
    }
  }

  function restartGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setScores({ X: 0, O: 0, draws: 0 });
    setTimer(customTime);
    setUndoCount(0);
  }

  function jumpTo(move) {
    setCurrentMove(move);
    setTimer(customTime);
  }

  function toggleTheme() {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    document.body.className = theme === "light" ? "dark" : "light";
  }

  function openSettings() {
    setShowSettings(true);
  }

  function closeSettings() {
    setShowSettings(false);
  }

  function saveSettings() {
    setCustomTime(Number(customTime));
    setTimer(Number(customTime));
    setShowSettings(false);
  }

  function toggleHelp() {
    setShowHelp(!showHelp);
  }

  function toggleTips() {
    setShowTips(!showTips);
  }

  const moves = history.map((squares, move) => {
    const description = move ? "Go to move #" + move : "Go to game start";
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className={`game ${theme}`}>
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          timer={timer}
        />
      </div>
      <div className="game-info">
        <button onClick={restartGame} className="restart-button">
          Restart Game
        </button>
        <button onClick={undoMove} className="theme-button">
          Undo Move (Limit: {undoLimit - undoCount})
        </button>
        <button onClick={toggleTheme} className="theme-button">
          Toggle {theme === "light" ? "Dark" : "Light"} Mode
        </button>
        <button onClick={openSettings} className="theme-button">
          Settings
        </button>
        <button onClick={toggleHelp} className="theme-button">
          Help
        </button>
        <button onClick={toggleTips} className="theme-button">
          Tips & Tricks
        </button>
        {showSettings && (
          <div className="settings-modal">
            <h2>Customize Timer</h2>
            <input
              type="number"
              min="1"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
            />
            <div>
              <label>
                <input
                  type="radio"
                  value="X"
                  checked={firstPlayer === "X"}
                  onChange={() => setFirstPlayer("X")}
                />
                X starts first
              </label>
              <label>
                <input
                  type="radio"
                  value="O"
                  checked={firstPlayer === "O"}
                  onChange={() => setFirstPlayer("O")}
                />
                O starts first
              </label>
            </div>
            <button onClick={saveSettings} className="theme-button">
              Save
            </button>
            <button onClick={closeSettings} className="restart-button">
              Cancel
            </button>
          </div>
        )}
        {showHelp && (
          <div className="settings-modal">
            <h2>How to Play</h2>
            <p>
              Tic-tac-toe is a simple game played on a 3x3 grid. Players take
              turns placing their mark (X or O) in an empty square. The first
              player to get three of their marks in a row (horizontally,
              vertically, or diagonally) wins the game. If all squares are
              filled without a winner, the game ends in a draw.
            </p>
            <button onClick={toggleHelp} className="restart-button">
              Close
            </button>
          </div>
        )}
        {showTips && (
          <div className="settings-modal">
            <h2>Tips & Tricks</h2>
            <ul>
              <li>Always start in a corner if you go first.</li>
              <li>Try to create a fork, giving you two ways to win.</li>
              <li>Block your opponent from creating a fork.</li>
              <li>
                Pay attention to the center square; it’s a powerful position.
              </li>
              <li>If you can’t win, play to block your opponent.</li>
            </ul>
            <button onClick={toggleTips} className="restart-button">
              Close
            </button>
          </div>
        )}
        <div
          className="scores"
          style={{ marginTop: "20px", marginBottom: "20px" }}
        >
          <p>Score:</p>
          <p>X: {scores.X} (Wins)</p>
          <p>O: {scores.O} (Wins)</p>
          <p>Draws: {scores.draws}</p>
        </div>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line };
    }
  }
  return null;
}

export default function App() {
  return <Game />;
}

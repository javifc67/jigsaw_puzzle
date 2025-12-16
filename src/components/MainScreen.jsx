import { useEffect, useState } from "react";
import "./../assets/scss/MainScreen.scss";
import { useContext } from "react";
import { GlobalContext } from "./GlobalContext";
import PiecesPool from "./PiecesPool";
import PuzzleBoard from "./PuzzleBoard";

export default function MainScreen({ config, sendSolution }) {
  const { I18n } = useContext(GlobalContext);
  const [pieces, setPieces] = useState([]);
  const [gridState, setGridState] = useState([]);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  useEffect(() => {
    if (config) {
      const r = config.rows || 3;
      const c = config.cols || 3;
      setRows(r);
      setCols(c);
      initializePuzzle(r, c);
    } else {
      initializePuzzle(3, 3);
    }
  }, [config]);

  useEffect(() => {
    if (gridState.length > 0 && gridState.every((cell) => cell !== null)) {
      const orderedPieces = gridState.map((pieceId) =>
        pieces.find((p) => p.id === pieceId)
      );

      const firstSide = orderedPieces[0].currentSide;
      const allSameSide = orderedPieces.every((p) => p.currentSide === firstSide);
      const allCorrectPositions = orderedPieces.every((p, index) => p.correctPosition === index);

      if (allSameSide && allCorrectPositions) {
        sendSolution(firstSide);
      }
    }
  }, [gridState, pieces]);

  const initializePuzzle = (r, c) => {
    const totalPieces = r * c;
    const newPieces = [];
    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        correctPosition: i,
        currentSide: Math.random() < 0.5 ? 1 : 2,
        isPlaced: false,
      });
    }

    for (let i = newPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]];
    }

    setPieces(newPieces);
    setGridState(Array(totalPieces).fill(null));
  };

  const handleDragStart = (e, pieceId) => {
    e.dataTransfer.setData("pieceId", pieceId);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const incomingPieceId = parseInt(e.dataTransfer.getData("pieceId"));
    if (isNaN(incomingPieceId)) return;

    const targetPieceId = gridState[index];
    const newGridState = [...gridState];
    const oldIndex = gridState.indexOf(incomingPieceId);

    if (oldIndex !== -1) {
      newGridState[oldIndex] = null;
    }

    newGridState[index] = incomingPieceId;

    if (targetPieceId !== null) {
      if (oldIndex !== -1) {
        newGridState[oldIndex] = targetPieceId;
      }
    }

    setGridState(newGridState);

    setPieces((prev) =>
      prev.map((p) => {
        if (p.id === incomingPieceId) {
          return { ...p, isPlaced: true };
        }
        if (targetPieceId !== null && oldIndex === -1 && p.id === targetPieceId) {
          return { ...p, isPlaced: false };
        }
        return p;
      })
    );
  };

  const handleDropToContainer = (e) => {
    e.preventDefault();
    const pieceId = parseInt(e.dataTransfer.getData("pieceId"));
    if (isNaN(pieceId)) return;

    const oldIndex = gridState.indexOf(pieceId);
    if (oldIndex !== -1) {
      const newGridState = [...gridState];
      newGridState[oldIndex] = null;
      setGridState(newGridState);
    }

    setPieces((prev) =>
      prev.map((p) => (p.id === pieceId ? { ...p, isPlaced: false } : p))
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const togglePieceSide = (pieceId) => {
    setPieces((prev) =>
      prev.map((p) =>
        p.id === pieceId
          ? { ...p, currentSide: p.currentSide === 1 ? 2 : 1 }
          : p
      )
    );
  };

  return (
    <div id="MainScreen" className="screen_wrapper">
      <PiecesPool
        pieces={pieces}
        config={config}
        rows={rows}
        cols={cols}
        onDragOver={handleDragOver}
        onDrop={handleDropToContainer}
        onDragStart={handleDragStart}
        onPieceClick={togglePieceSide}
        I18n={I18n}
      />
      <div className="puzzle-container">
        <PuzzleBoard
          gridState={gridState}
          pieces={pieces}
          rows={rows}
          cols={cols}
          config={config}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onPieceClick={togglePieceSide}
          I18n={I18n}
        />
      </div>
    </div>
  );
}

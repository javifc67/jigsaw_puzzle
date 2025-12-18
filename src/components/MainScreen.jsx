import { useEffect, useState, useRef } from "react";
import "./../assets/scss/MainScreen.scss";
import { useContext } from "react";
import { GlobalContext } from "./GlobalContext";
import PiecesPool from "./PiecesPool";
import PuzzleBoard from "./PuzzleBoard";
import useSound from "../hooks/useSound";

export default function MainScreen({ config, sendSolution, result }) {
  const { I18n } = useContext(GlobalContext);
  const [pieces, setPieces] = useState([]);
  const [gridState, setGridState] = useState([]);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const maxZIndex = useRef(100);
  const winSound = useSound(config.winAudio);

  useEffect(() => {
    if (!config) return;
    const r = config.rows || 3;
    const c = config.cols || 3;
    setRows(r);
    setCols(c);
    initializePuzzle(r, c);

  }, [config]);

  useEffect(() => {
    if (result && result.success === true) {
      winSound.play();
    }
  }, [result]);

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


  const assignInitialPositions = (pieces) => {
    // Grid configuration for the pool
    const COLS = 2;
    const ROWS = 6;
    const SLOTS = COLS * ROWS;

    return pieces.map((piece, i) => {
      const slot = i % SLOTS;

      const col = slot % COLS;
      const row = Math.floor(slot / COLS);

      // Piece width is roughly 45% of pool width Column 0 starts near 2%, Column 1 near 48%
      let baseX = col === 0 ? 0.02 : 0.48;

      // Rows spaced by ~14%
      let baseY = row * 0.14;

      // Add small random jitter so stacked pieces are visible
      const jitterX = (Math.random() - 0.5) * 0.08;
      const jitterY = (Math.random() - 0.5) * 0.08;

      let poolX = baseX + jitterX;
      let poolY = baseY + jitterY;

      // Clamp to safe visible area (approx 0 to 55% width, 0 to 80% height)
      poolX = Math.max(0, Math.min(0.55, poolX));
      poolY = Math.max(0, Math.min(0.80, poolY));

      return { ...piece, poolX, poolY, zIndex: 1 };
    });
  };

  const initializePuzzle = (r, c) => {
    const totalPieces = r * c;
    let newPieces = [];
    maxZIndex.current = 100;

    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        correctPosition: i,
        currentSide: Math.random() < 0.5 ? 1 : 2,
        isPlaced: false,
        zIndex: 1,
      });
    }

    // Shuffle
    for (let i = newPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]];
    }

    newPieces = assignInitialPositions(newPieces);

    setPieces(newPieces);
    setGridState(Array(totalPieces).fill(null));
  };

  const isLocked = result && result.success === true;

  const handlePieceHover = (pieceId) => {
    if (isLocked) return;

    setPieces((prev) => {
      const piece = prev.find(p => p.id === pieceId);
      if (!piece || piece.zIndex === maxZIndex.current) return prev;

      maxZIndex.current += 1;
      return prev.map(p => p.id === pieceId ? { ...p, zIndex: maxZIndex.current } : p);
    });
  };

  const handleDragStart = (e, pieceId) => {
    if (isLocked) return;
    e.dataTransfer.setData("pieceId", pieceId);
    handlePieceHover(pieceId);

    // Calculate offset from the element's top-left to the mouse pointer
    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    e.dataTransfer.setData("offsetX", offsetX);
    e.dataTransfer.setData("offsetY", offsetY);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (isLocked) return;
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
    if (isLocked) return;
    const pieceId = parseInt(e.dataTransfer.getData("pieceId"));
    if (isNaN(pieceId)) return;

    const poolRect = e.currentTarget.getBoundingClientRect();
    const offsetX = parseFloat(e.dataTransfer.getData("offsetX")) || 0;
    const offsetY = parseFloat(e.dataTransfer.getData("offsetY")) || 0;

    // adjust by offsetX/Y to place the top-left of the piece correctly relative to mouse
    let relativeX = (e.clientX - poolRect.left - offsetX) / poolRect.width;
    let relativeY = (e.clientY - poolRect.top - offsetY) / poolRect.height;

    // Clamp values to ensure it stays somewhat visible (0 to 1) 
    relativeX = Math.max(0, Math.min(1, relativeX));
    relativeY = Math.max(0, Math.min(1, relativeY));

    const oldIndex = gridState.indexOf(pieceId);
    if (oldIndex !== -1) {
      const newGridState = [...gridState];
      newGridState[oldIndex] = null;
      setGridState(newGridState);
    }

    setPieces((prev) =>
      prev.map((p) => (p.id === pieceId ? { ...p, isPlaced: false, poolX: relativeX, poolY: relativeY } : p))
    );
  };

  const handleDragOver = (e) => {
    if (isLocked) return;
    e.preventDefault();
  };

  const togglePieceSide = (pieceId) => {
    if (isLocked) return;
    setPieces((prev) =>
      prev.map((p) =>
        p.id === pieceId
          ? { ...p, currentSide: p.currentSide === 1 ? 2 : 1 }
          : p
      )
    );
    handlePieceHover(pieceId);
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
        onPieceHover={handlePieceHover}
        I18n={I18n}
        isLocked={isLocked}
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
          isLocked={isLocked}
        />
      </div>
    </div>
  );
}

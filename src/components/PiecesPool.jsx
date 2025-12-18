import PuzzlePiece from "./PuzzlePiece";

export default function PiecesPool({
    pieces,
    config,
    rows,
    cols,
    onDragOver,
    onDrop,
    onDragStart,
    onPieceClick,
    onPieceHover,
    I18n,
    isLocked,
}) {
    const visiblePieces = pieces.filter((p) => !p.isPlaced);

    return (
        <div
            className="pieces-pool"
        >
            <h3>{I18n.getTrans("i.pieces")}</h3>
            <div
                className="pieces-list"
                onDragOver={onDragOver}
                onDrop={onDrop}
            >
                {visiblePieces.map((piece) => (
                    <PuzzlePiece
                        key={piece.id}
                        piece={piece}
                        config={config}
                        rows={rows}
                        cols={cols}
                        onDragStart={onDragStart}
                        onPieceClick={onPieceClick}
                        onMouseEnter={() => onPieceHover && onPieceHover(piece.id)}
                        isLocked={isLocked}
                        style={{
                            position: "absolute",
                            left: `${(piece.poolX !== undefined ? piece.poolX : Math.random() * 0.55) * 100}%`,
                            top: `${(piece.poolY !== undefined ? piece.poolY : Math.random() * 0.77) * 100}%`,
                            zIndex: piece.zIndex || 1,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

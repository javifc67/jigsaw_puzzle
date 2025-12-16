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
    I18n,
}) {
    return (
        <div
            className="pieces-pool"
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <h3>{I18n.getTrans("i.pieces")}</h3>
            <div className="pieces-list">
                {pieces
                    .filter((p) => !p.isPlaced)
                    .map((piece) => (
                        <PuzzlePiece
                            key={piece.id}
                            piece={piece}
                            config={config}
                            rows={rows}
                            cols={cols}
                            onDragStart={onDragStart}
                            onPieceClick={onPieceClick}
                        />
                    ))}
            </div>
        </div>
    );
}

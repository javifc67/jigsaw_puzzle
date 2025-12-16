import PuzzlePiece from "./PuzzlePiece";

export default function PuzzleBoard({
    gridState,
    pieces,
    rows,
    cols,
    config,
    onDragOver,
    onDrop,
    onDragStart,
    onPieceClick,
    I18n,
}) {
    return (
        <div className="puzzle-board">
            <h3>{I18n.getTrans("i.board")}</h3>
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                }}
            >
                {gridState.map((pieceId, index) => {
                    const piece = pieces.find((p) => p.id === pieceId);
                    return (
                        <div
                            key={index}
                            className="grid-cell"
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, index)}
                        >
                            {piece && (
                                <PuzzlePiece
                                    piece={piece}
                                    config={config}
                                    rows={rows}
                                    cols={cols}
                                    onDragStart={onDragStart}
                                    onPieceClick={onPieceClick}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

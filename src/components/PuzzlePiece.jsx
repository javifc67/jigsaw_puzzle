
export default function PuzzlePiece({ piece, config, rows, cols, onDragStart, onPieceClick }) {
    const getBackgroundStyle = (piece) => {
        const imgUrl = piece.currentSide === 1 ? config.image1 : config.image2;
        const row = Math.floor(piece.correctPosition / cols);
        const col = piece.correctPosition % cols;

        const xPos = cols > 1 ? (col * 100) / (cols - 1) : 0;
        const yPos = rows > 1 ? (row * 100) / (rows - 1) : 0;

        return {
            backgroundImage: `url(${imgUrl})`,
            backgroundPosition: `${xPos}% ${yPos}%`,
            backgroundSize: `${cols * 100}% ${rows * 100}%`,
        };
    };

    return (
        <div
            className="puzzle-piece"
            draggable
            onDragStart={(e) => onDragStart(e, piece.id)}
            onClick={() => onPieceClick(piece.id)}
            style={getBackgroundStyle(piece)}
        />
    );
}

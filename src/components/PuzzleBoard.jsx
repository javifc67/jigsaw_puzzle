import PuzzlePiece from "./PuzzlePiece";
import { useEffect, useRef, useState, useMemo } from "react";

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
    slicedImages,
    I18n,
    isLocked,
    hasImages,
}) {
    const boardWrapperRef = useRef(null);
    const [containerSize, setContainerSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        if (!boardWrapperRef.current) return;
        const observer = new ResizeObserver(([entry]) => {
            setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        });
        observer.observe(boardWrapperRef.current);

        return () => observer.disconnect();
    }, []);

    const gridStyle = useMemo(() => {
        const { width: availWidth, height: availHeight } = containerSize;
        if (availWidth === 0 || availHeight === 0 || !rows || !cols) {
            return {
                grid: {},
                frame: {}
            };
        }

        const hasFrame = !!config.frameImg;
        // Frame thickness/padding
        const framePaddingTop = hasFrame ? config.framePaddingTop : 0;
        const framePaddingBottom = hasFrame ? config.framePaddingBottom : 0;
        const framePaddingLeft = hasFrame ? config.framePaddingLeft : 0;
        const framePaddingRight = hasFrame ? config.framePaddingRight : 0;

        // Adjust available space for the grid by subtracting frame padding
        const effectiveWidth = availWidth - (framePaddingLeft + framePaddingRight);
        const effectiveHeight = availHeight - (framePaddingTop + framePaddingBottom);

        const gap = 1;
        const maxCellWidth = (effectiveWidth - gap * (cols - 1)) / cols;
        const maxCellHeight = (effectiveHeight - gap * (rows - 1)) / rows;

        const cellSize = Math.min(maxCellWidth, maxCellHeight);

        if (cellSize <= 0) {
            return {
                grid: { opacity: 0 },
                frame: {}
            };
        }

        const totalWidth = cellSize * cols + gap * (cols - 1);
        const totalHeight = cellSize * rows + gap * (rows - 1);

        return {
            grid: {
                width: `${totalWidth}px`,
                height: `${totalHeight}px`,
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
            },
            frame: {
                // Use border instead of padding + background to prevent corner deformation (9-slice scaling)
                borderStyle: "solid",
                borderWidth: `${framePaddingTop}px ${framePaddingRight}px ${framePaddingBottom}px ${framePaddingLeft}px`,
                borderImageSource: hasFrame ? `url(${config.frameImg})` : "none",
                // Slice values match the visual border thickness (padding) to preserve corners
                borderImageSlice: `${framePaddingTop} ${framePaddingRight} ${framePaddingBottom} ${framePaddingLeft}`,
                borderImageRepeat: "stretch",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxSizing: "content-box",
            }
        };
    }, [containerSize, rows, cols, config.frameImg]);

    return (
        <div className="puzzle-board">
            {!hasImages && <h3>{I18n.getTrans("i.board")}</h3>}
            <div
                className="board-area"
                ref={boardWrapperRef}
                style={{
                    flex: 1,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden"
                }}
            >
                <div
                    className="frame-wrapper"
                    style={gridStyle.frame}
                >
                    <div
                        className="grid"
                        style={gridStyle.grid}
                    >
                        {gridState.map((pieceId, index) => {
                            const piece = pieces.find((p) => p.id === pieceId);
                            return (
                                <div
                                    key={index}
                                    className="grid-cell"
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDrop(e, index)}
                                    style={{
                                        opacity: isLocked ? 0.8 : 1,
                                        background: hasImages ? "rgba(223, 223, 223, 1)" : "rgba(255, 255, 255, 0.1)",

                                    }}
                                >
                                    {piece && (
                                        <PuzzlePiece
                                            piece={piece}
                                            config={config}
                                            rows={rows}
                                            cols={cols}
                                            onDragStart={onDragStart}
                                            onPieceClick={onPieceClick}
                                            isLocked={isLocked}
                                            tileUrl={
                                                slicedImages
                                                    ? (piece.currentSide === 1
                                                        ? (slicedImages.side1 ? slicedImages.side1[piece.correctPosition] : null)
                                                        : (slicedImages.side2 ? slicedImages.side2[piece.correctPosition] : null)
                                                    )
                                                    : null
                                            }
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

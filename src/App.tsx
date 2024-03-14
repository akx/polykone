import React from "react";

function getXY(e: React.MouseEvent): [number, number] {
  const snap = e.shiftKey ? 10 : 1;
  const offset = e.currentTarget?.getBoundingClientRect();
  const x = Math.round((e.clientX - offset?.left ?? 0) / snap) * snap;
  const y = Math.round((e.clientY - offset?.top ?? 0) / snap) * snap;
  return [x, y];
}

export default function App() {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [img, setImg] = React.useState<string>();
  const [tool, setTool] = React.useState<"draw" | "move" | "split" | "delete">(
    "draw",
  );
  const [prospectivePoint, setProspectivePoint] = React.useState<
    [number, number] | null
  >(null);
  const [movingIndex, setMovingIndex] = React.useState<number | null>(null);
  const [points, setPoints] = React.useState<[number, number][]>([]);
  const loadBlob = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    reader.onload = () => setImg(reader.result as string);
    const file = e.target.files?.[0];
    if (file) reader.readAsDataURL(file);
  };
  const addPoint = function (e: React.MouseEvent) {
    const [x, y] = getXY(e);
    setPoints((points) => [...points, [x, y]]);
  };
  const handleMove = function (e: React.MouseEvent) {
    if (movingIndex === null) {
      return;
    }
    const [x, y] = getXY(e);
    setPoints((points) => {
      const newPoints = [...points];
      newPoints[movingIndex] = [x, y];
      return newPoints;
    });
  };

  function createSplitAfter(index: number) {
    setPoints((points) => {
      const [x1, y1] = points[index]!;
      const [x2, y2] = points[(index + 1) % points.length]!;
      return [
        ...points.slice(0, index + 1),
        [(x1 + x2) / 2, (y1 + y2) / 2],
        ...points.slice(index + 1),
      ];
    });
  }

  const deleteAt = (i: number) => {
    setPoints((points) => points.filter((_, j) => j !== i));
  };

  React.useEffect(() => {
    if (tool !== "move") setMovingIndex(null);
    if (tool !== "draw") setProspectivePoint(null);
  }, [tool]);

  return (
    <div className="App">
      <header>
        <div>
          Choose image file:
          <input type="file" accept="image/*" onChange={loadBlob} />
        </div>
        <button
          onClick={() => setTool("draw")}
          style={{ fontWeight: tool === "draw" ? "bold" : undefined }}
        >
          Draw
        </button>
        <button
          onClick={() => setTool("move")}
          disabled={!points.length}
          style={{ fontWeight: tool === "move" ? "bold" : undefined }}
        >
          Move
        </button>
        <button
          onClick={() => setTool("split")}
          disabled={!points.length}
          style={{ fontWeight: tool === "split" ? "bold" : undefined }}
        >
          Split
        </button>
        <button
          onClick={() => setTool("delete")}
          disabled={!points.length}
          style={{ fontWeight: tool === "delete" ? "bold" : undefined }}
        >
          Delete
        </button>
        <div>&middot;</div>
        <button
          onClick={() =>
            points.length && confirm("Clear?") ? setPoints([]) : void 8
          }
        >
          Clear
        </button>
        {tool === "draw" ? (
          <button
            onClick={() => setPoints((points) => [...points.slice(0, -1)])}
          >
            Undo last point
          </button>
        ) : null}
        <div className="spacer"></div>
        <textarea value={JSON.stringify(points)} readOnly />
      </header>
      <div style={{ position: "relative" }}>
        <img
          style={{
            position: "absolute",
            cursor: tool == "draw" ? "crosshair" : undefined,
            userSelect: "none",
          }}
          ref={imgRef}
          src={img}
          hidden={!img}
          onClick={tool === "draw" ? addPoint : undefined}
          onMouseMove={
            tool === "draw"
              ? (e: React.MouseEvent) => {
                  setProspectivePoint(getXY(e));
                }
              : undefined
          }
          onMouseOut={
            tool === "draw" ? () => setProspectivePoint(null) : undefined
          }
        />
        <svg
          width={imgRef.current?.width}
          height={imgRef.current?.height}
          style={{
            position: "absolute",
            pointerEvents: tool == "draw" ? "none" : undefined,
          }}
          onMouseMove={tool === "move" ? handleMove : undefined}
          onMouseUp={() => setMovingIndex(null)}
        >
          <polygon
            points={points.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="cyan"
            stroke="black"
            strokeDasharray="10, 10"
            strokeWidth={3}
            fillOpacity={0.2}
            style={{ pointerEvents: "none" }}
          />
          {tool === "draw" && points.length > 1 && prospectivePoint ? (
            <polygon
              points={[...points, prospectivePoint]
                .map(([x, y]) => `${x},${y}`)
                .join(" ")}
              fill="white"
              stroke="black"
              strokeDasharray="5, 5"
              strokeWidth={1}
              fillOpacity={0.2}
              strokeOpacity={0.5}
              style={{ pointerEvents: "none" }}
            />
          ) : null}
          {points.map(([x, y], i) => (
            <circle
              cx={x}
              cy={y}
              r={7}
              key={i}
              fill={
                tool == "move" || tool == "split"
                  ? movingIndex === i
                    ? "black"
                    : "lime"
                  : i === points.length - 1
                    ? "white"
                    : "red"
              }
              stroke={"black"}
              style={{ cursor: tool == "move" ? "move" : "pointer" }}
              onMouseDown={
                tool === "move" ? () => setMovingIndex(i) : undefined
              }
              onClick={
                tool === "split"
                  ? () => createSplitAfter(i)
                  : tool === "delete"
                    ? () => deleteAt(i)
                    : undefined
              }
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

import React from "react";

export default function App() {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [img, setImg] = React.useState<string>();
  const [tool, setTool] = React.useState<"draw" | "move">("draw");
  const [movingIndex, setMovingIndex] = React.useState<number | null>(null);
  const [points, setPoints] = React.useState<[number, number][]>([]);
  const loadBlob = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    reader.onload = () => setImg(reader.result as string);
    const file = e.target.files?.[0];
    if (file) reader.readAsDataURL(file);
  };
  const addPoint = function (e: React.MouseEvent) {
    const offset = e.currentTarget?.getBoundingClientRect();
    const x = e.clientX - offset?.left;
    const y = e.clientY - offset?.top;
    setPoints((points) => [...points, [x, y]]);
  };
  const handleMove = function (e: React.MouseEvent) {
    if (movingIndex === null) {
      return;
    }
    const snap = e.shiftKey ? 10 : 1;
    const offset = e.currentTarget?.getBoundingClientRect();
    const x = Math.round((e.clientX - offset?.left) / snap) * snap;
    const y = Math.round((e.clientY - offset?.top) / snap) * snap;
    setPoints((points) => {
      const newPoints = [...points];
      newPoints[movingIndex] = [x, y];
      return newPoints;
    });
  };

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
          style={{ fontWeight: tool === "move" ? "bold" : undefined }}
        >
          Move
        </button>
        <div>&middot;</div>
        <button
          onClick={() =>
            points.length && confirm("Clear?") ? setPoints([]) : void 8
          }
        >
          Clear
        </button>
        <button onClick={() => setPoints((points) => [...points.slice(0, -1)])}>
          Undo
        </button>
        <div className="spacer"></div>
        <textarea value={JSON.stringify(points)} readOnly />
      </header>
      <div style={{ position: "relative" }}>
        <img
          style={{
            position: "absolute",
            cursor: tool == "draw" ? "crosshair" : undefined,
          }}
          ref={imgRef}
          src={img}
          hidden={!img}
          onClick={tool === "draw" ? addPoint : undefined}
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
          {points.map(([x, y], i) => (
            <circle
              cx={x}
              cy={y}
              r={7}
              key={i}
              fill={tool == "move" ? "lime" : "red"}
              stroke={tool == "move" ? "black" : undefined}
              style={{ cursor: "move" }}
              onMouseDown={
                tool === "move" ? () => setMovingIndex(i) : undefined
              }
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

import React from "react";

export default function App() {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [img, setImg] = React.useState<string>();
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

  return (
    <div className="App">
      Choose image file:
      <input type="file" accept="image/*" onChange={loadBlob} />
      <br />
      <button onClick={() => setPoints([])}>Clear</button>
      <button onClick={() => setPoints((points) => [...points.slice(0, -1)])}>
        Undo
      </button>
      <br />
      <textarea value={JSON.stringify(points)} readOnly />
      <hr />
      <div style={{ position: "relative" }}>
        <img
          style={{ position: "absolute" }}
          ref={imgRef}
          src={img}
          hidden={!img}
          onClick={addPoint}
        />
        <svg
          width={imgRef.current?.width}
          height={imgRef.current?.height}
          style={{ position: "absolute", pointerEvents: "none" }}
        >
          <polygon
            points={points.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="red"
            stroke="black"
            strokeDasharray="10, 10"
            strokeWidth={3}
            fillOpacity={0.2}
          />
          {points.map(([x, y], i) => (
            <circle cx={x} cy={y} r={5} key={i} fill="red" />
          ))}
        </svg>
      </div>
    </div>
  );
}

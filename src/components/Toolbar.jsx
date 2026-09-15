import { useSceneStore } from "../store/sceneStore.js";

export default function Toolbar() {
  const addObject = useSceneStore((s) => s.addObject);

  return (
    <div className="absolute top-4 left-4 flex gap-2 bg-neutral-900/90 border border-neutral-700 rounded-lg p-2">
      {["box", "sphere", "cone"].map((shape) => (
        <button
          key={shape}
          onClick={() => addObject(shape)}
          className="text-xs px-3 py-2 rounded-md border border-neutral-600 text-white hover:border-green-400 hover:text-green-400 transition-colors capitalize"
        >
          + {shape}
        </button>
      ))}
    </div>
  );
}
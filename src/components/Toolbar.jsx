
import { useSceneStore } from "../store/sceneStore.js";

export default function Toolbar() {
  const addObject = useSceneStore((s) => s.addObject);

  return (
    <div className="absolute top-16 sm:top-4 left-2 sm:left-4 flex gap-1 sm:gap-2 bg-neutral-900/90 border border-neutral-700 rounded-lg p-1.5 sm:p-2">
      {["box", "sphere", "cone"].map((shape) => (
        <button
          key={shape}
          onClick={() => addObject(shape)}
          className="text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border border-neutral-600 text-white hover:border-green-400 hover:text-green-400 transition-colors capitalize"
        >
          + {shape}
        </button>
      ))}
    </div>
  );
}
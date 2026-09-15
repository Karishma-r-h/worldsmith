import { useSceneStore } from "../store/sceneStore.js";

export default function InspectorPanel() {
  const selectedId = useSceneStore((s) => s.selectedId);
  const objects = useSceneStore((s) => s.objects);
  const updateObject = useSceneStore((s) => s.updateObject);
  const removeObject = useSceneStore((s) => s.removeObject);

  const object = objects.find((o) => o.id === selectedId);
  if (!object) return null; // nothing selected, show nothing

  const setAxis = (axisIndex, value) => {
    const next = [...object.position];
    next[axisIndex] = Number(value) || 0;
    updateObject(object.id, { position: next });
  };

  return (
    <div className="absolute top-4 right-4 w-56 bg-neutral-900/90 border border-neutral-700 rounded-lg p-4 flex flex-col gap-3 text-white">
      <p className="text-xs uppercase tracking-wide text-neutral-400">
        Selected: {object.shape}
      </p>

      <div>
        <p className="text-xs text-neutral-400 mb-1">Position (x, y, z)</p>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              type="number"
              step="0.5"
              value={object.position[i]}
              onChange={(e) => setAxis(i, e.target.value)}
              className="bg-neutral-800 rounded px-2 py-1 text-xs w-full"
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-neutral-400 mb-1">Color</p>
        <input
          type="color"
          value={object.color}
          onChange={(e) => updateObject(object.id, { color: e.target.value })}
          className="w-full h-8 rounded cursor-pointer"
        />
      </div>

      <button
        onClick={() => removeObject(object.id)}
        className="mt-2 text-xs py-2 rounded-md border border-red-500 text-red-400 hover:bg-red-500/10"
      >
        Delete object
      </button>
    </div>
  );
}
import { useRef } from "react";
import { useSceneStore } from "../store/sceneStore.js";

export default function TopBar() {
  const fileInputRef = useRef();
  const lighting = useSceneStore((s) => s.lighting);
  const setLighting = useSceneStore((s) => s.setLighting);
  const fog = useSceneStore((s) => s.fog);
  const setFog = useSceneStore((s) => s.setFog);
  const serializeScene = useSceneStore((s) => s.serializeScene);
  const loadScene = useSceneStore((s) => s.loadScene);

  const handleSave = () => {
    const blob = new Blob([serializeScene()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scene.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(loadScene);
    e.target.value = ""; // lets you load the same filename again later if needed
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-neutral-900/90 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs">
      <select
        value={lighting.mood}
        onChange={(e) => setLighting(e.target.value)}
        className="bg-transparent outline-none capitalize"
      >
        {["midday", "sunset", "night"].map((m) => (
          <option key={m} value={m} className="bg-neutral-900">
            {m}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-1 cursor-pointer">
        <input
          type="checkbox"
          checked={fog.enabled}
          onChange={(e) => setFog({ enabled: e.target.checked })}
        />
        Fog
      </label>

      <div className="w-px h-4 bg-neutral-700" />

      <button onClick={handleSave} className="hover:text-green-400">
        Save
      </button>
      <button onClick={() => fileInputRef.current?.click()} className="hover:text-green-400">
        Load
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleLoad}
        hidden
      />
    </div>
  );
}
import { useSceneStore } from "../store/sceneStore.js";

const MOOD_PRESETS = {
  midday: { sky: "#BFD7EA", sun: "#FFFFFF", intensity: 1.2, ambient: 0.6 },
  sunset: { sky: "#3A2A2E", sun: "#E8955C", intensity: 0.9, ambient: 0.35 },
  night: { sky: "#0C0F1C", sun: "#6E80B3", intensity: 0.25, ambient: 0.15 },
};

export default function Environment() {
  const lighting = useSceneStore((s) => s.lighting);
  const fog = useSceneStore((s) => s.fog);
  const preset = MOOD_PRESETS[lighting.mood] ?? MOOD_PRESETS.midday;

  return (
    <>
      <color attach="background" args={[preset.sky]} />
      {fog.enabled && <fogExp2 attach="fog" args={[preset.sky, fog.density]} />}
      <ambientLight intensity={preset.ambient} />
      <directionalLight
        position={[6, 10, 4]}
        color={preset.sun}
        intensity={preset.intensity}
        castShadow
      />
    </>
  );
}
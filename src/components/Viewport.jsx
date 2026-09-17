import Environment from "./Environment.jsx";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useSceneStore } from "../store/sceneStore.js";
import { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { resolveAssetForPrompt } from "../lib/assetQueue.js";
import GeneratedAsset from "./GeneratedAsset.jsx";

const GEOMETRY = {
  box: <boxGeometry args={[1, 1, 1]} />,
  sphere: <sphereGeometry args={[0.6, 24, 24]} />,
  cone: <coneGeometry args={[0.6, 1.2, 24]} />,
  icosahedron: <icosahedronGeometry args={[0.7, 0]} />,
};

function SceneObject({ object }) {
  const selectedId = useSceneStore((s) => s.selectedId);
  const selectObject = useSceneStore((s) => s.selectObject);
  const resolveAsset = useSceneStore((s) => s.resolveAsset);
  const failAsset = useSceneStore((s) => s.failAsset);
  const isSelected = selectedId === object.id;
  const isGenerating = object.status === "generating";
  const isReady = object.status === "ready" && object.assetUrl;

  const [scaleIn, setScaleIn] = useState(isReady ? 1 : 0.001);

  useEffect(() => {
    if (object.status !== "generating" || !object.prompt) return;
    let cancelled = false;
    resolveAssetForPrompt(object.prompt)
      .then((url) => {
        if (!cancelled) resolveAsset(object.id, url);
      })
      .catch((err) => {
        console.error("Generation failed:", err);
        if (!cancelled) failAsset(object.id);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object.id, object.status]);

  useEffect(() => {
    if (object.status === "ready") setScaleIn(0.001);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object.assetUrl]);

  useFrame((_, delta) => {
    if (scaleIn < 1) setScaleIn((v) => Math.min(1, v + delta * 3));
  });

  return (
    <group
      position={object.position}
      scale={isReady ? scaleIn : 1}
      onClick={(e) => {
        e.stopPropagation();
        selectObject(object.id);
      }}
    >
      {isReady ? (
        <GeneratedAsset url={object.assetUrl} />
      ) : (
          <mesh castShadow>
          {GEOMETRY[object.shape] ?? GEOMETRY.box}
          <meshStandardMaterial
            color={object.color}
            emissive={isSelected ? "#8A9A80" : object.prompt ? "#D8A55C" : "#000000"}
            emissiveIntensity={isSelected ? 0.4 : object.prompt ? 0.3 : 0}
            flatShading={!!object.prompt}
          />
        </mesh>
      )}
    </group>
  );
}

export default function Viewport() {
  const objects = useSceneStore((s) => s.objects);
  const selectObject = useSceneStore((s) => s.selectObject);

  return (
    <Canvas
      shadows
      camera={{ position: [6, 5, 8], fov: 45 }}
      onPointerMissed={() => selectObject(null)}
    >
      <Environment />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2B2A26" />
      </mesh>

      {objects.map((obj) => (
        <SceneObject key={obj.id} object={obj} />
      ))}

      <OrbitControls makeDefault minDistance={2} maxDistance={30} />
    </Canvas>
  );
}
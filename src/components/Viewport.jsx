import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useSceneStore } from "../store/sceneStore.js";

const GEOMETRY = {
  box: <boxGeometry args={[1, 1, 1]} />,
  sphere: <sphereGeometry args={[0.6, 24, 24]} />,
  cone: <coneGeometry args={[0.6, 1.2, 24]} />,
};

function SceneObject({ object }) {
  const selectedId = useSceneStore((s) => s.selectedId);
  const selectObject = useSceneStore((s) => s.selectObject);
  const isSelected = selectedId === object.id;

  return (
    <mesh
      position={object.position}
      castShadow
      onClick={(e) => {
        e.stopPropagation(); // stops the click from also deselecting via the ground plane
        selectObject(object.id);
      }}
    >
      {GEOMETRY[object.shape] ?? GEOMETRY.box}
      <meshStandardMaterial
        color={object.color}
        emissive={isSelected ? "#8A9A80" : "#000000"}
        emissiveIntensity={isSelected ? 0.4 : 0}
      />
    </mesh>
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
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 4]} intensity={1.2} castShadow />

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
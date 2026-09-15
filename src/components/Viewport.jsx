import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function Viewport() {
  return (
    <Canvas shadows camera={{ position: [6, 5, 8], fov: 45 }}>
      {/* Lighting: without this, everything would render pitch black */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 4]} intensity={1.2} castShadow />

      {/* Ground plane: a big flat rectangle to stand objects on */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2B2A26" />
      </mesh>

      {/* A single test cube, just to prove 3D objects render correctly */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8A9A80" />
      </mesh>

      {/* Lets you click-drag to rotate the camera, scroll to zoom */}
      <OrbitControls makeDefault minDistance={2} maxDistance={30} />
    </Canvas>
  );
}
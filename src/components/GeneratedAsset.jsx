import { useGLTF } from "@react-three/drei";

export default function GeneratedAsset({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene.clone()} />;
}
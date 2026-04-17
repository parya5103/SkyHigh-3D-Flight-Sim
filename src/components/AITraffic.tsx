import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { ErrorBoundary } from './ErrorBoundary';
import { Suspense } from 'react';

// AI Traffic types and their simple flight paths
const AI_COUNT = 15;

const ASSET_URL = '/assets/models/arwing.glb';

function AIPlaneModel({ type }: { type: 'AIRLINER' | 'PRIVATE' }) {
  const gltf = useGLTF(ASSET_URL);
  // Clone to avoid sharing same group instance across all traffic
  const cloned = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  return <primitive object={cloned} />;
}

function AIPlaneFallback({ type }: { type: 'AIRLINER' | 'PRIVATE' }) {
  return (
    <mesh>
      <boxGeometry args={[1, 0.5, 3]} />
      <meshStandardMaterial color={type === 'AIRLINER' ? "#f8fafc" : "#f59e0b"} />
    </mesh>
  );
}

export function AITraffic() {
  const isPlaying = useGameStore((state) => state.isPlaying);

  // Initialize random AI positions and velocities
  const aiState = useMemo(() => {
    return Array.from({ length: AI_COUNT }).map((_, i) => ({
      id: `ai-${i}`,
      type: (Math.random() > 0.3 ? 'AIRLINER' : 'PRIVATE') as 'AIRLINER' | 'PRIVATE',
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 20000,
        Math.random() * 5000 + 1000,
        (Math.random() - 0.5) * 20000
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 100
      ),
      rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0)
    }));
  }, []);

  const instancesRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    aiState.forEach((ai) => {
      ai.position.addScaledVector(ai.velocity, delta);

      if (ai.position.length() > 30000) {
        ai.position.set(
          (Math.random() - 0.5) * 10000,
          Math.random() * 5000 + 1000,
          (Math.random() - 0.5) * 10000
        );
      }

      ai.rotation.y = Math.atan2(ai.velocity.x, ai.velocity.z);
    });
  });

  return (
    <group ref={instancesRef}>
      {aiState.map((ai, i) => (
        <group key={ai.id} position={ai.position} rotation={ai.rotation} scale={ai.type === 'AIRLINER' ? 5 : 2}>
           <ErrorBoundary key={ASSET_URL} fallback={<AIPlaneFallback type={ai.type} />}>
             <Suspense fallback={<AIPlaneFallback type={ai.type} />}>
               <AIPlaneModel type={ai.type} />
             </Suspense>
           </ErrorBoundary>
           <pointLight 
              color={i % 2 === 0 ? "#ef4444" : "#22c55e"} 
              intensity={10} 
              distance={100} 
              position={[2, 0.5, 0]} 
           />
        </group>
      ))}
    </group>
  );
}

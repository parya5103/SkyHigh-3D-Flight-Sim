import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

// AI Traffic types and their simple flight paths
const AI_COUNT = 15;

export function AITraffic() {
  const [modelError, setModelError] = useState(false);
  const gltf = useGLTF('https://raw.githubusercontent.com/pmndrs/drei-assets/master/airplane.glb', true, true, (error) => {
    console.error("AI Traffic Model Load Error:", error);
    setModelError(true);
  });
  
  const isPlaying = useGameStore((state) => state.isPlaying);
  const setAITraffic = useGameStore((state) => state.setAITraffic);

  // Initialize random AI positions and velocities
  const aiState = useMemo(() => {
    return Array.from({ length: AI_COUNT }).map((_, i) => ({
      id: `ai-${i}`,
      type: Math.random() > 0.3 ? 'AIRLINER' : 'PRIVATE' as const,
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
           {!modelError && gltf ? (
              <primitive object={gltf.scene.clone()} />
           ) : (
              <mesh>
                 <boxGeometry args={[1, 0.5, 3]} />
                 <meshStandardMaterial color={ai.type === 'AIRLINER' ? "white" : "orange"} />
              </mesh>
           )}
           <pointLight 
              color={i % 2 === 0 ? "red" : "green"} 
              intensity={10} 
              distance={100} 
              position={[2, 0.5, 0]} 
           />
        </group>
      ))}
    </group>
  );
}

useGLTF.preload('https://raw.githubusercontent.com/pmndrs/drei-assets/master/airplane.glb');

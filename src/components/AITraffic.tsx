import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

// AI Traffic types and their simple flight paths
const AI_COUNT = 15;

export function AITraffic() {
  const { scene } = useGLTF('https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/airplane.glb');
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

    const trafficData: any[] = [];

    aiState.forEach((ai, i) => {
      // Basic linear movement
      ai.position.addScaledVector(ai.velocity, delta);

      // Boundaries - loop back
      if (ai.position.length() > 30000) {
        ai.position.set(
          (Math.random() - 0.5) * 10000,
          Math.random() * 5000 + 1000,
          (Math.random() - 0.5) * 10000
        );
      }

      // Update visual rotation based on velocity
      ai.rotation.y = Math.atan2(ai.velocity.x, ai.velocity.z);

      trafficData.push({
        id: ai.id,
        type: ai.type,
        position: [ai.position.x, ai.position.y, ai.position.z],
        rotation: [ai.rotation.x, ai.rotation.y, ai.rotation.z],
        speed: ai.velocity.length(),
      });
    });

    // Update global store for UI tracking (radar etc)
    // setAITraffic(trafficData); // Can be expensive if done every frame, let's optimize if needed
  });

  return (
    <group ref={instancesRef}>
      {aiState.map((ai) => (
        <group key={ai.id} position={ai.position} rotation={ai.rotation} scale={ai.type === 'AIRLINER' ? 5 : 2}>
           <primitive object={scene.clone()} />
           {/* Add a blinking beacon light for realism */}
           <pointLight 
              color={Math.random() > 0.5 ? "red" : "green"} 
              intensity={10} 
              distance={100} 
              position={[2, 0.5, 0]} 
           />
        </group>
      ))}
    </group>
  );
}

useGLTF.preload('https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/airplane.glb');

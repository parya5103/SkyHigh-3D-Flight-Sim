import { useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import { Group } from 'three';

// A placeholder for a free GLB model. 
const PLANE_MODEL_URL = 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/airplane/model.gltf';

export function Airplane() {
  const { scene } = useGLTF(PLANE_MODEL_URL);
  const group = useRef<Group>(null);

  return (
    <group ref={group}>
      <primitive object={scene} scale={[0.5, 0.5, 0.5]} rotation={[0, Math.PI, 0]} />
      {/* Lights for cockpit */}
      <pointLight position={[0, 0.5, -0.5]} intensity={0.5} color="#44ff44" />
    </group>
  );
}

useGLTF.preload(PLANE_MODEL_URL);

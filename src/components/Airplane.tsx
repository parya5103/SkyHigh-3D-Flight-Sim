import { useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import { Group } from 'three';
import { useGameStore } from '../store/gameStore';
import { AIRCRAFT_MODELS } from '../lib/constants';

export function Airplane() {
  const selectedAircraftId = useGameStore((state) => state.selectedAircraftId);
  const aircraftDef = AIRCRAFT_MODELS.find(a => a.id === selectedAircraftId) || AIRCRAFT_MODELS[0];
  
  const { scene } = useGLTF(aircraftDef.url);
  const group = useRef<Group>(null);

  const aircraftConfig = {
    swift: { scale: 0.5, rotation: [0, Math.PI, 0] },
    stealth: { scale: 0.5, rotation: [0, Math.PI, 0] },
    vtol: { scale: 0.4, rotation: [0, Math.PI, 0] },
  }[aircraftDef.id] || { scale: 0.5, rotation: [0, Math.PI, 0] };

  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        scale={aircraftConfig.scale} 
        rotation={aircraftConfig.rotation} 
      />
      {/* Dynamic Navigation Lights */}
      <pointLight position={[0, 0.5, -0.5]} intensity={0.5} color="#44ff44" />
    </group>
  );
}

AIRCRAFT_MODELS.forEach(a => useGLTF.preload(a.url));

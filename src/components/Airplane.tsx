import { useGLTF } from '@react-three/drei';
import { useRef, Suspense, useMemo } from 'react';
import { Group } from 'three';
import { useGameStore } from '../store/gameStore';
import { AIRCRAFT_MODELS } from '../lib/constants';
import { ErrorBoundary } from './ErrorBoundary';

function ProceduralAirplane({ scale }: { scale: number }) {
  return (
    <group scale={scale}>
      {/* Fuselage */}
      <mesh>
        <boxGeometry args={[1, 0.8, 4]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* Wings */}
      <mesh position={[0, 0, 0.5]}>
        <boxGeometry args={[6, 0.1, 1.5]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Tail - Vertical */}
      <mesh position={[0, 0.8, -1.8]}>
        <boxGeometry args={[0.1, 1.2, 0.8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Tail - Horizontal */}
      <mesh position={[0, 0.2, -1.8]}>
        <boxGeometry args={[1.5, 0.1, 0.6]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

function ModelLoader({ url, config }: { url: string, config: any }) {
  const gltf = useGLTF(url);

  return (
    <primitive 
      object={gltf.scene} 
      scale={config.scale} 
      rotation={config.rotation} 
    />
  );
}

export function Airplane() {
  const selectedAircraftId = useGameStore((state) => state.selectedAircraftId);
  const aircraftDef = AIRCRAFT_MODELS.find(a => a.id === selectedAircraftId) || AIRCRAFT_MODELS[0];
  const group = useRef<Group>(null);

  const aircraftConfig = {
    swift: { scale: 0.5, rotation: [0, Math.PI, 0] },
    stealth: { scale: 0.8, rotation: [0, Math.PI, 0] },
    vtol: { scale: 1.2, rotation: [0, -Math.PI/2, 0] },
  }[aircraftDef.id] || { scale: 0.5, rotation: [0, Math.PI, 0] };

  return (
    <group ref={group}>
      <ErrorBoundary fallback={<ProceduralAirplane scale={aircraftConfig.scale * 2} />}>
        <Suspense fallback={<ProceduralAirplane scale={aircraftConfig.scale * 2} />}>
          <ModelLoader url={aircraftDef.url} config={aircraftConfig} />
        </Suspense>
      </ErrorBoundary>
      <pointLight position={[0, 0.5, -0.5]} intensity={0.5} color="#44ff44" />
    </group>
  );
}

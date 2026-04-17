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
  // We use try-catch or rely on Suspense + ErrorBoundary.
  // useGLTF actually throws if it fails, which is what we want for ErrorBoundary to catch.
  const gltf = useGLTF(url);

  return (
    <primitive 
      object={gltf.scene} 
      scale={config.scale} 
      rotation={config.rotation} 
      castShadow
      receiveShadow
    />
  );
}

export function Airplane() {
  const selectedAircraftId = useGameStore((state) => state.selectedAircraftId);
  const aircraftDef = AIRCRAFT_MODELS.find(a => a.id === selectedAircraftId) || AIRCRAFT_MODELS[0];
  const group = useRef<Group>(null);

  const aircraftConfig = {
    swift: { scale: 0.08, rotation: [0, Math.PI, 0] },
    stealth: { scale: 0.15, rotation: [0, Math.PI, 0] },
    vtol: { scale: 0.2, rotation: [0, 0, 0] },
  }[aircraftDef.id] || { scale: 0.1, rotation: [0, Math.PI, 0] };

  // Generate a key based on the URL to force re-render/re-catch if URL changes
  return (
    <group ref={group}>
      <ErrorBoundary key={aircraftDef.url} fallback={<ProceduralAirplane scale={aircraftConfig.scale * 20} />}>
        <Suspense fallback={<ProceduralAirplane scale={aircraftConfig.scale * 20} />}>
          <ModelLoader url={aircraftDef.url} config={aircraftConfig} />
        </Suspense>
      </ErrorBoundary>
      <pointLight position={[0, 2, 2]} intensity={2} color="#ffffff" />
    </group>
  );
}

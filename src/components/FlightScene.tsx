import { Canvas } from '@react-three/fiber';
import { Sky, PointerLockControls, KeyboardControls, Environment, Stars, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import { FlightPhysics } from './FlightPhysics';
import { Airplane } from './Airplane';
import { MapLayer } from './MapLayer';
import { Weather } from './Weather';
import { AITraffic } from './AITraffic';
import { MissionManager } from './MissionManager';
import { useGameStore } from '../store/gameStore';

export function FlightScene() {
  const isPlaying = useGameStore((state) => state.isPlaying);

  const keyMap = useMemo(() => [
    { name: 'throttleUp', keys: ['Shift'] },
    { name: 'throttleDown', keys: ['Control'] },
    { name: 'pitchUp', keys: ['ArrowUp', 'w'] },
    { name: 'pitchDown', keys: ['ArrowDown', 's'] },
    { name: 'rollLeft', keys: ['ArrowLeft', 'a'] },
    { name: 'rollRight', keys: ['ArrowRight', 'd'] },
    { name: 'yawLeft', keys: ['q'] },
    { name: 'yawRight', keys: ['e'] },
    { name: 'brake', keys: ['b', ' '] },
    { name: 'exit', keys: ['Escape'] },
  ], []);

  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden">
      <KeyboardControls map={keyMap}>
        <Canvas shadows dpr={[1, 2]}>
          <Suspense fallback={null}>
            {/* Environment */}
            <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Environment preset="night" />
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

            {/* Flight Core */}
            <FlightPhysics>
              <Airplane />
              <Weather />
              <AITraffic />
              <MissionManager />
              {/* Follow Camera */}
              <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={75} />
            </FlightPhysics>

            {/* World */}
            <MapLayer />

            <PointerLockControls />
          </Suspense>
        </Canvas>
      </KeyboardControls>
      
      {!isPlaying && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="text-white text-center">
               <h2 className="text-4xl font-bold mb-4">Click to Start Flight</h2>
               <p className="text-slate-300">Controls: WASD + Shift/Ctrl</p>
            </div>
         </div>
      )}
    </div>
  );
}

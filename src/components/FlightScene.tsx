import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, PointerLockControls, KeyboardControls, Environment, Stars, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import { FlightPhysics } from './FlightPhysics';
import { Airplane } from './Airplane';
import { Weather } from './Weather';
import { AITraffic } from './AITraffic';
import { MissionManager } from './MissionManager';
import { useGameStore } from '../store/gameStore';

import { Atmosphere } from './Atmosphere';
import { SoundEngine } from './SoundEngine';
import { ErrorBoundary } from './ErrorBoundary';

export function FlightScene() {
  const isPlaying = useGameStore((state) => state.isPlaying);
  const telemetry = useGameStore((state) => state.telemetry);

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
    <div className="w-full h-full bg-[#05070A] overflow-hidden">
      <SoundEngine />
      <KeyboardControls map={keyMap}>
        <Canvas shadows dpr={[1, 2]}>
          <ErrorBoundary fallback={<mesh><boxGeometry /><meshStandardMaterial color="red" /></mesh>}>
            <Suspense fallback={null}>
              {/* Environment */}
              <Atmosphere />

              {/* Flight Core */}
              <FlightPhysics>
                <Airplane />
                <Weather />
                <AITraffic />
                <MissionManager />
                
                {/* Follow Camera with Shake Effect */}
                <CameraRig 
                  speed={telemetry.speed} 
                  isPlaying={isPlaying} 
                  pitch={telemetry.pitch}
                  roll={telemetry.roll}
                />
              </FlightPhysics>

              <PointerLockControls />
            </Suspense>
          </ErrorBoundary>
        </Canvas>
      </KeyboardControls>
      
      {!isPlaying && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xl z-50">
            <div className="text-white text-center animate-pulse">
               <h2 className="text-xl font-mono tracking-[0.4em] uppercase opacity-50 mb-2">System Diagnostic</h2>
               <div className="h-0.5 w-64 bg-white/20 mx-auto mb-8" />
               <p className="text-sm font-mono tracking-widest text-[#00E5FF]">CLICK TO ENGAGE SIMULATION</p>
            </div>
         </div>
      )}
    </div>
  );
}

function CameraRig({ speed, isPlaying, pitch, roll }: { speed: number, isPlaying: boolean, pitch: number, roll: number }) {
  const cameraRef = useRef<any>(null);

  useFrame((state) => {
    if (!isPlaying) return;
    
    // Calculate shake intensity based on speed (turbulence simulation)
    const shakeIntensity = Math.min(0.05, speed / 5000);
    const time = state.clock.getElapsedTime();
    
    state.camera.position.x += Math.sin(time * 20) * shakeIntensity;
    state.camera.position.y += Math.cos(time * 25) * shakeIntensity;
    
    // Smooth Look (Subtle lag/inertia) - actually PerspectiveCamera in FlightPhysics handles look
    // But we can add micro-adjustments here
  });

  return (
    <PerspectiveCamera 
      ref={cameraRef}
      makeDefault 
      position={[0, 5, 12]} 
      fov={75} 
    />
  );
}

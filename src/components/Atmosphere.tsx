import { useMemo } from 'react';
import { Sky, Environment, Stars, Cloud } from '@react-three/drei';
import SunCalc from 'suncalc';
import { useGameStore } from '../store/gameStore';

export function Atmosphere() {
  const selectedCity = useGameStore((state) => state.selectedCity);
  
  // Calculate sun position based on current time and selected city (default to SF if none)
  const sunData = useMemo(() => {
    const now = new Date();
    const lat = selectedCity?.lat || 37.7749;
    const lng = selectedCity?.lng || -122.4194;
    const position = SunCalc.getPosition(now, lat, lng);
    
    // Convert azimuth/altitude to 3D vector for R3F
    const azimuth = position.azimuth; 
    const altitude = position.altitude;
    
    const x = Math.cos(altitude) * Math.sin(azimuth);
    const y = Math.sin(altitude);
    const z = Math.cos(altitude) * Math.cos(azimuth);
    
    return {
      vector: [x * 100, y * 100, z * 100] as [number, number, number],
      isDay: altitude > -0.1, // Slight negative for twilight
      intensity: Math.max(0, Math.min(1.5, Math.sin(altitude) * 2 + 0.5))
    };
  }, [selectedCity]);

  return (
    <>
      <Sky 
        distance={450000} 
        sunPosition={sunData.vector} 
        inclination={0.5} 
        azimuth={0.25} 
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        rayleigh={3}
        turbidity={0.1}
      />
      
      {!sunData.isDay && (
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      )}
      
      <Environment 
        preset={sunData.isDay ? "sunset" : "night"} 
        blur={0.5}
      />
      
      {/* High-fidelity lighting environment (HDRI Haven inspired) */}
      <Environment 
        files="https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/hdri/sky.hdr" 
      />
      
      <ambientLight intensity={sunData.isDay ? 0.3 * sunData.intensity : 0.05} />
      
      <directionalLight 
        position={sunData.vector} 
        intensity={sunData.isDay ? sunData.intensity : 0.01} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />

      {/* Volumetric Clouds (Performance sensitive) */}
      <Cloud 
        opacity={0.5}
        speed={0.4}
        segments={20}
        position={[0, 100, 0]}
      />
    </>
  );
}

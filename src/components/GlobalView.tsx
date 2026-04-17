import React from 'react';
import { CesiumScene } from './CesiumScene';
import { useGameStore } from '../store/gameStore';

export function GlobalView() {
  const isPlaying = useGameStore((state) => state.isPlaying);
  
  return (
    <div className="absolute inset-0 pointer-events-none">
       {/* Cesium stays in background */}
       <div className={`absolute inset-0 transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-40'}`}>
          <CesiumScene />
       </div>
       
       {/* We can add Three.js overlay here if we want to sync them */}
    </div>
  );
}

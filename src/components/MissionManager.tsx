import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { MISSIONS } from '../lib/constants';

export function MissionManager() {
  const mission = useGameStore((state) => state.mission);
  const telemetry = useGameStore((state) => state.telemetry);
  const updateMission = useGameStore((state) => state.updateMission);
  const completeMission = useGameStore((state) => state.completeMission);
  const failMission = useGameStore((state) => state.failMission);
  const isPlaying = useGameStore((state) => state.isPlaying);

  const lastTimeRef = useRef(0);

  useFrame((state) => {
    if (!isPlaying || !mission.activeId || mission.isCompleted || mission.isFailed) return;

    const activeDef = MISSIONS.find(m => m.id === mission.activeId);
    if (!activeDef) return;

    // 1. Update Timer
    const now = state.clock.elapsedTime;
    if (now - lastTimeRef.current >= 1) {
      const newTime = Math.max(0, mission.timeRemaining - 1);
      updateMission({ timeRemaining: newTime });
      if (newTime === 0) failMission();
      lastTimeRef.current = now;
    }

    // 2. Performance Tracking (Distance to Target)
    // In this simplified sim, we don't have true GPS -> 3D conversion easily calculated here
    // without more complex ECEF logic. Let's use internal relative distance for now.
    // Assuming target is at some coordinate. 
    // For demo, let's trigger "proximity" based on a mock calculation
    
    // 3. Victory Conditions
    if (activeDef.type === 'LANDING') {
      // If speed is very low and altitude is near 0
      if (telemetry.speed < 20 && telemetry.altitude < 10 && telemetry.throttle < 5) {
        completeMission();
      }
    } else if (activeDef.type === 'CARGO' || activeDef.type === 'RESCUE') {
      // Mock "reach target" logic
      // In a real app, I'd calculate distance between player.position and target.coords
      // For this turn, we'll simulate progress increase
      const newProgress = Math.min(100, mission.progress + 0.01);
      updateMission({ progress: newProgress });
      
      if (newProgress >= 100) {
        completeMission();
      }
    }
  });

  return null;
}

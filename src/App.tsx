import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { FlightScene } from './components/FlightScene';
import { HUD } from './components/HUD';
import { Dashboard } from './components/Dashboard';
import { GrowthEngine } from './components/GrowthEngine';
import { io } from 'socket.io-client';

const socket = io();

export default function App() {
  const isPlaying = useGameStore((state) => state.isPlaying);
  const telemetry = useGameStore((state) => state.telemetry);
  const addPlayer = useGameStore((state) => state.addMultiplayerPlayer);
  const removePlayer = useGameStore((state) => state.removeMultiplayerPlayer);
  const setMultiplayerPlayers = useGameStore((state) => state.setMultiplayerPlayers);

  // 1. Multiplayer Synchronization
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to multiplayer server');
      if (isPlaying) {
        socket.emit('join', { position: [0, 0, 0] });
      }
    });

    socket.on('currentPlayers', (players) => setMultiplayerPlayers(players));
    socket.on('playerJoined', (player) => addPlayer(player));
    socket.on('playerMoved', (player) => addPlayer(player));
    socket.on('playerLeft', (id) => removePlayer(id));

    return () => {
      socket.off('playerJoined');
      socket.off('playerMoved');
      socket.off('playerLeft');
      socket.off('currentPlayers');
    };
  }, [isPlaying, addPlayer, removePlayer, setMultiplayerPlayers]);

  // Periodic position update to server
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      socket.emit('updatePosition', {
        position: [0, telemetry.altitude, 0], // In a real app we'd pass real coordinates
        rotation: [telemetry.pitch, telemetry.yaw, telemetry.roll],
        speed: telemetry.speed,
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, telemetry]);

  // 2. Voice Commands Integration
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase();
        console.log('Voice Command:', command);

        if (command.includes('throttle up') || command.includes('full power')) {
          // In a real implementation we'd hook into the keyboard control stream or direct telemetry
        }
      };

      recognition.start();
      return () => recognition.stop();
    }
  }, []);

  return (
    <main className="w-screen h-screen relative bg-black overflow-hidden select-none">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <FlightScene />
      </div>

      {/* Interface Layers */}
      <HUD />
      <Dashboard />
      <GrowthEngine />

      {/* Network Overlays (Small indicators) */}
      <div className="absolute top-4 left-4 z-[100] flex flex-col gap-2">
         {/* Could list other players here */}
      </div>

      {/* Global Overlays */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none"
          />
        )}
      </AnimatePresence>
    </main>
  );
}

import { AnimatePresence, motion } from 'motion/react';

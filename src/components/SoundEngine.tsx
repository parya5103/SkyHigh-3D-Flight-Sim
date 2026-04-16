import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export function SoundEngine() {
  const isPlaying = useGameStore((state) => state.isPlaying);
  const isPaused = useGameStore((state) => state.isPaused);
  const telemetry = useGameStore((state) => state.telemetry);
  
  const audioCtx = useRef<AudioContext | null>(null);
  const engineNode = useRef<OscillatorNode | null>(null);
  const windNode = useRef<BiquadFilterNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const windGainNode = useRef<GainNode | null>(null);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // --- Engine Sound (Complex drone) ---
        gainNode.current = audioCtx.current.createGain();
        gainNode.current.gain.value = 0.1;
        gainNode.current.connect(audioCtx.current.destination);

        const osc = audioCtx.current.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, audioCtx.current.currentTime);
        osc.connect(gainNode.current);
        osc.start();
        engineNode.current = osc;

        // --- Wind Noise (Pink noise approximation) ---
        const bufferSize = 2 * audioCtx.current.sampleRate;
        const noiseBuffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = audioCtx.current.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = audioCtx.current.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        
        windGainNode.current = audioCtx.current.createGain();
        windGainNode.current.gain.value = 0.05;

        whiteNoise.connect(filter);
        filter.connect(windGainNode.current);
        windGainNode.current.connect(audioCtx.current.destination);
        whiteNoise.start();
        windNode.current = filter;
      } else {
        audioCtx.current.resume();
      }
    } else {
      audioCtx.current?.suspend();
    }
  }, [isPlaying, isPaused]);

  // Handle Telemetry updates
  useEffect(() => {
    if (!audioCtx.current || !engineNode.current || !gainNode.current || !windNode.current || !windGainNode.current) return;

    // Pitch follows throttle
    const enginePitch = 50 + (telemetry.throttle * 1.5);
    engineNode.current.frequency.setTargetAtTime(enginePitch, audioCtx.current.currentTime, 0.1);
    
    // Volume follows throttle slightly
    gainNode.current.gain.setTargetAtTime(0.05 + (telemetry.throttle / 500), audioCtx.current.currentTime, 0.2);

    // Wind follows speed
    const windFreq = 500 + (telemetry.speed * 5);
    windNode.current.frequency.setTargetAtTime(windFreq, audioCtx.current.currentTime, 0.2);
    windGainNode.current.gain.setTargetAtTime(Math.min(0.1, telemetry.speed / 2000), audioCtx.current.currentTime, 0.3);

  }, [telemetry]);

  return null;
}

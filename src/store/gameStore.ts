import { create } from 'zustand';

interface Telemetry {
  altitude: number;
  speed: number;
  throttle: number;
  pitch: number;
  roll: number;
  yaw: number;
  fuel: number;
  gearDown: boolean;
  flaps: number;
}

interface MissionStatus {
  activeId: string | null;
  progress: number;
  timeRemaining: number;
  isCompleted: boolean;
  isFailed: boolean;
}

interface AIVehicle {
  id: string;
  type: 'AIRLINER' | 'PRIVATE';
  position: [number, number, number];
  rotation: [number, number, number];
  speed: number;
}

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  selectedCity: { name: string; lat: number; lng: number } | null;
  telemetry: Telemetry;
  multiplayerPlayers: any[];
  mission: MissionStatus;
  aiTraffic: AIVehicle[];
  
  setPlaying: (playing: boolean) => void;
  setCity: (city: any) => void;
  updateTelemetry: (data: Partial<Telemetry>) => void;
  setMultiplayerPlayers: (players: any[]) => void;
  addMultiplayerPlayer: (player: any) => void;
  removeMultiplayerPlayer: (id: string) => void;
  
  startMission: (missionId: string) => void;
  updateMission: (data: Partial<MissionStatus>) => void;
  completeMission: () => void;
  failMission: () => void;
  setAITraffic: (vehicles: AIVehicle[]) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPlaying: false,
  isPaused: false,
  selectedCity: null,
  telemetry: {
    altitude: 0,
    speed: 0,
    throttle: 0,
    pitch: 0,
    roll: 0,
    yaw: 0,
    fuel: 100,
    gearDown: true,
    flaps: 0,
  },
  multiplayerPlayers: [],
  mission: {
    activeId: null,
    progress: 0,
    timeRemaining: 0,
    isCompleted: false,
    isFailed: false,
  },
  aiTraffic: [],

  setPlaying: (playing) => set((state) => ({ 
    isPlaying: playing,
    // Reset mission if stopping
    mission: playing ? state.mission : { activeId: null, progress: 0, timeRemaining: 0, isCompleted: false, isFailed: false }
  })),
  setCity: (city) => set({ selectedCity: city }),
  updateTelemetry: (data) => set((state) => ({ 
    telemetry: { ...state.telemetry, ...data } 
  })),
  setMultiplayerPlayers: (players) => set({ multiplayerPlayers: players }),
  addMultiplayerPlayer: (player) => set((state) => ({ 
    multiplayerPlayers: [...state.multiplayerPlayers.filter(p => p.id !== player.id), player] 
  })),
  removeMultiplayerPlayer: (id) => set((state) => ({ 
    multiplayerPlayers: state.multiplayerPlayers.filter(p => p.id !== id) 
  })),

  startMission: (missionId) => set((state) => {
    const missionDef = state.mission; // Simplified
    return {
      mission: {
        activeId: missionId,
        progress: 0,
        timeRemaining: 300, // Default or find in constant
        isCompleted: false,
        isFailed: false,
      }
    };
  }),
  updateMission: (data) => set((state) => ({
    mission: { ...state.mission, ...data }
  })),
  completeMission: () => set((state) => ({
    mission: { ...state.mission, isCompleted: true }
  })),
  failMission: () => set((state) => ({
    mission: { ...state.mission, isFailed: true }
  })),
  setAITraffic: (vehicles) => set({ aiTraffic: vehicles }),
}));

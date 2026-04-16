import { create } from 'zustand';
import { logEvent } from '../lib/growthHacker';

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
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null;
  isAuthReady: boolean;
  selectedCity: { name: string; lat: number; lng: number } | null;
  selectedAircraftId: string;
  telemetry: Telemetry;
  multiplayerPlayers: any[];
  mission: MissionStatus;
  aiTraffic: AIVehicle[];
  userMetrics: {
    xp: number;
    level: number;
    credits: number;
    totalFlightTime: number;
  };
  
  setPlaying: (playing: boolean) => void;
  setCity: (city: any) => void;
  setAircraft: (id: string) => void;
  updateTelemetry: (data: Partial<Telemetry>) => void;
  setMultiplayerPlayers: (players: any[]) => void;
  addMultiplayerPlayer: (player: any) => void;
  removeMultiplayerPlayer: (id: string) => void;
  
  startMission: (missionId: string) => void;
  updateMission: (data: Partial<MissionStatus>) => void;
  completeMission: () => void;
  failMission: () => void;
  setAITraffic: (vehicles: AIVehicle[]) => void;
  setUser: (user: any) => void;
  setAuthReady: (ready: boolean) => void;
  updateUserMetrics: (metrics: Partial<GameState['userMetrics']>) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPlaying: false,
  isPaused: false,
  user: null,
  isAuthReady: false,
  selectedCity: null,
  selectedAircraftId: 'swift',
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
  userMetrics: {
    xp: 0,
    level: 1,
    credits: 0,
    totalFlightTime: 0,
  },

  setPlaying: (playing: boolean) => {
    logEvent(playing ? 'SIM_START' : 'SIM_STOP');
    set((state) => ({ 
      isPlaying: playing,
      // Reset mission if stopping
      mission: playing ? state.mission : { activeId: null, progress: 0, timeRemaining: 0, isCompleted: false, isFailed: false }
    }));
  },
  setCity: (city) => set({ selectedCity: city }),
  setAircraft: (id) => set({ selectedAircraftId: id }),
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
  completeMission: () => set((state) => {
    logEvent('MISSION_COMPLETE', { id: state.mission.activeId });
    return {
      mission: { ...state.mission, isCompleted: true },
      userMetrics: {
        ...state.userMetrics,
        xp: state.userMetrics.xp + 500,
        credits: state.userMetrics.credits + 1000
      }
    };
  }),
  failMission: () => {
    logEvent('MISSION_FAIL');
    set((state) => ({
      mission: { ...state.mission, isFailed: true }
    }));
  },
  setAITraffic: (vehicles) => set({ aiTraffic: vehicles }),
  setUser: (user) => set({ user }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),
  updateUserMetrics: (metrics) => set((state) => ({
    userMetrics: { ...state.userMetrics, ...metrics }
  })),
}));

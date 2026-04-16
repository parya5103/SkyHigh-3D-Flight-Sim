export const PLANE_STATS = {
  mass: 1200, // kg (Cessna 172 class)
  wingArea: 16.2, // m^2
  liftCoefficientMax: 1.5,
  dragCoefficientZero: 0.025,
  thrustMax: 4500, // Newtons
  maxThrottle: 1.0,
  minThrottle: 0.0,
  controlSensitivity: {
    pitch: 0.5,
    roll: 0.8,
    yaw: 0.3,
  },
};

export const CITIES = [
  { name: "New York", lat: 40.7128, lng: -74.0060, elevation: 100 },
  { name: "London", lat: 51.5074, lng: -0.1278, elevation: 100 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, elevation: 100 },
  { name: "Paris", lat: 48.8566, lng: 2.3522, elevation: 100 },
  { name: "San Francisco", lat: 37.7749, lng: -122.4194, elevation: 100 },
  { name: "Dubai", lat: 25.2048, lng: 55.2708, elevation: 100 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, elevation: 100 },
];

export const INITIAL_LAT_LNG = { lat: 37.7749, lng: -122.4194 }; // SF Default

export type MissionType = 'LANDING' | 'CARGO' | 'RESCUE';

export const MISSIONS = [
  {
    id: 'm1',
    title: 'Touchdown Precision',
    description: 'Perform a perfect landing at SFO Runway 28L. Minimum speed, smooth descent.',
    type: 'LANDING' as MissionType,
    target: { name: 'SFO Runway 28L', lat: 37.6190, lng: -122.3748 },
    reward: 500,
    timeLimit: 300,
  },
  {
    id: 'm2',
    title: 'Trans-Atlantic Supply',
    description: 'Deliver medical supplies from the coast to the inner city hub before nightfall.',
    type: 'CARGO' as MissionType,
    target: { name: 'Inner City Hub', lat: 37.7858, lng: -122.4008 },
    reward: 1200,
    timeLimit: 600,
  },
  {
    id: 'm3',
    title: 'Mountain Rescue',
    description: 'A stranded hiker needs immediate evacuation. Reach the rescue point in record time.',
    type: 'RESCUE' as MissionType,
    target: { name: 'Summit Point', lat: 37.8272, lng: -122.4230 },
    reward: 2000,
    timeLimit: 180,
  }
];

export const AI_TYPES = {
  AIRLINER: { label: 'Airbus A320', scale: 2.0, color: '#FFFFFF', speed: 120 },
  PRIVATE: { label: 'Cessna 172', scale: 0.5, color: '#D48166', speed: 60 }
};

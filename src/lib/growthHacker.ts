/**
 * GROWTH HACKER UTILITIES
 * Implements AB Testing, Event Tracking, and Retention Mechanisms
 */

export type ABGroup = 'CONTROL' | 'VARIANT_A' | 'VARIANT_B';

export const getABGroup = (): ABGroup => {
  // Simple deterministic bucket based on a stored UUID or randomized per session
  const stored = localStorage.getItem('sim_ab_group');
  if (stored) return stored as ABGroup;
  
  const groups: ABGroup[] = ['CONTROL', 'VARIANT_A', 'VARIANT_B'];
  const random = groups[Math.floor(Math.random() * groups.length)];
  localStorage.setItem('sim_ab_group', random);
  return random;
};

export const logEvent = (eventName: string, properties: Record<string, any> = {}) => {
  const timestamp = new Date().toISOString();
  const abGroup = getABGroup();
  const event = { eventName, properties, abGroup, timestamp };
  
  // In a real app, this would send to Segment/Mixpanel/Amplitude
  console.log(`[GROWTH_HACKER_LOG]`, event);
  
  // Buffer events locally for visualization/analysis
  const buffer = JSON.parse(localStorage.getItem('sim_event_log') || '[]');
  buffer.push(event);
  if (buffer.length > 100) buffer.shift();
  localStorage.setItem('sim_event_log', JSON.stringify(buffer));
};

export const GROWTH_STRATEGIES = {
  RETENTION_HOOK: "Add daily login bonus (+500 Credits)",
  SEO_KEYWORDS: ["flight simulator online", "free airplane game", "3D flight sim browser"],
  VIRAL_CLIP_PROMPT: "Record a landing with < 5 knots vertical speed or a 360 flip.",
  MONETIZATION: "Season Pass: Unlock 'Golden Wing' skins and 'Mach Speed' thrust."
};

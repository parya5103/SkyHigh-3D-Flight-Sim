import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, Trophy, CheckCircle, AlertTriangle, ChevronUp, ChevronDown, Plane, Zap } from 'lucide-react';
import { MISSIONS, CITIES, AIRCRAFT_MODELS } from '../lib/constants';
import { useEffect, useState } from 'react';

function SpeedTape({ value }: { value: number }) {
  return (
    <div className="absolute left-10 top-1/2 -translate-y-1/2 w-20 h-96 bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden flex flex-col items-center">
       <div className="absolute inset-y-0 w-px bg-white/20 right-4" />
       <motion.div 
         animate={{ y: value * 2 }} 
         transition={{ type: 'spring', damping: 20, stiffness: 100 }}
         className="flex flex-col gap-10 py-48"
       >
          {[...Array(20)].map((_, i) => (
             <div key={i} className="flex items-center gap-2 h-0">
                <span className="text-[10px] font-mono text-white/40">{(20 - i) * 50}</span>
                <div className="w-4 h-px bg-white/40" />
             </div>
          ))}
       </motion.div>
       <div className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center">
          <div className="bg-[#00E5FF] px-2 py-1 text-black font-mono font-bold text-xs ring-1 ring-white/20">
             {Math.round(value)}
          </div>
       </div>
    </div>
  );
}

function AltitudeTape({ value }: { value: number }) {
  return (
    <div className="absolute right-10 top-1/2 -translate-y-1/2 w-20 h-96 bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden flex flex-col items-center">
       <div className="absolute inset-y-0 w-px bg-white/20 left-4" />
       <motion.div 
         animate={{ y: value / 10 }} 
         transition={{ type: 'spring', damping: 25, stiffness: 80 }}
         className="flex flex-col gap-10 py-48"
       >
          {[...Array(20)].map((_, i) => (
             <div key={i} className="flex items-center gap-2 h-0">
                <div className="w-4 h-px bg-white/40" />
                <span className="text-[10px] font-mono text-white/40">{(20 - i) * 500}</span>
             </div>
          ))}
       </motion.div>
       <div className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center">
          <div className="bg-[#a8eb12] px-2 py-1 text-black font-mono font-bold text-xs ring-1 ring-white/20">
             {Math.round(value)}
          </div>
       </div>
    </div>
  );
}

function CompassTape({ yaw }: { yaw: number }) {
  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-10 bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden">
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-2 bg-[#00E5FF] z-10" />
       <motion.div 
         animate={{ x: -(yaw * 180 / Math.PI) * 2 }}
         transition={{ type: 'spring', damping: 30, stiffness: 150 }}
         className="flex gap-20 px-[50%]"
       >
          {['N', 'E', 'S', 'W', 'N'].map((dir, i) => (
             <div key={i} className="flex flex-col items-center min-w-[20px]">
                <span className="text-white font-mono text-xs font-bold">{dir}</span>
                <div className="w-px h-2 bg-white/40" />
             </div>
          ))}
       </motion.div>
    </div>
  );
}

function HUDParam({ label, value, color = '#fff' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex flex-col items-center min-w-[60px]">
       <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest mb-1">{label}</span>
       <span className="text-sm font-bold font-mono tracking-tight" style={{ color }}>{value}</span>
    </div>
  );
}

export function HUD() {
  const telemetry = useGameStore((state) => state.telemetry);
  const isPlaying = useGameStore((state) => state.isPlaying);
  const mission = useGameStore((state) => state.mission);
  const setPlaying = useGameStore((state) => state.setPlaying);
  const updateTelemetry = useGameStore((state) => state.updateTelemetry);
  const userMetrics = useGameStore((state) => state.userMetrics);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isPlaying) return null;

  const activeDef = MISSIONS.find(m => m.id === mission.activeId);

  // Mobile Control Handlers
  const handleThrottleChange = (delta: number) => {
    const newThrottle = Math.max(0, Math.min(1.0, (telemetry.throttle * 100 + delta) / 100));
    updateTelemetry({ throttle: newThrottle });
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 selection:bg-none overflow-hidden">
       {/* Background Grid Ambience */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

       {/* --- Glass Cockpit Tapes --- */}
       {!isMobile && (
         <>
            <SpeedTape value={telemetry.speed} />
            <AltitudeTape value={telemetry.altitude} />
            <CompassTape yaw={telemetry.yaw} />
         </>
       )}

       {isMobile && (
          <div className="absolute top-10 inset-x-0 px-6 flex justify-between">
             <div className="flex flex-col">
                <span className="text-[6px] text-white/40 font-mono tracking-widest">KNOTS</span>
                <span className="text-3xl font-black text-white">{Math.round(telemetry.speed)}</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[6px] text-white/40 font-mono tracking-widest">ALT_FT</span>
                <span className="text-3xl font-black text-[#a8eb12]">{Math.round(telemetry.altitude)}</span>
             </div>
          </div>
       )}

       {/* --- Central Attitude Display --- */}
       <div className="absolute inset-0 flex items-center justify-center">
          {/* Horizon Line */}
          <motion.div 
            animate={{ 
               rotate: -(telemetry.roll * 180 / Math.PI),
               y: (telemetry.pitch * 180 / Math.PI) * (isMobile ? 1.5 : 2.5)
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="w-[100vw] h-px bg-white/20 relative"
          >
             <div className="absolute left-1/2 -translate-x-1/2 -top-2 flex gap-1">
                {[...Array(10)].map((_, i) => (
                   <div key={i} className="w-1 h-1 rounded-full bg-white/40" />
                ))}
             </div>
          </motion.div>

          {/* Center Reticle */}
          <div className="relative w-40 h-40 border border-white/5 rounded-full flex items-center justify-center">
             <div className="w-10 h-0.5 bg-[#00E5FF] absolute left-0" />
             <div className="w-10 h-0.5 bg-[#00E5FF] absolute right-0" />
             <div className="w-0.5 h-10 bg-[#00E5FF] absolute top-1/2 -translate-y-1/2" />
             <div className="w-2 h-2 rounded-full border border-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />
          </div>
       </div>

       {/* --- Bottom Stats Dock --- */}
       <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-1 px-8 py-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-sm">
          <HUDParam label="THR" value={`${Math.round(telemetry.throttle * 100)}%`} color={telemetry.throttle > 0.8 ? '#00E5FF' : '#fff'} />
          <div className="w-px h-8 bg-white/10 mx-4" />
          <HUDParam label="FLPS" value={telemetry.flaps ? 'EXT' : 'RET'} color={telemetry.flaps ? '#00E5FF' : '#fff'} />
          <div className="w-px h-8 bg-white/10 mx-4" />
          <HUDParam label="GEAR" value={telemetry.gearDown ? 'DWN' : 'UP'} color={telemetry.gearDown ? '#44ff44' : '#ff4444'} />
          <div className="w-px h-8 bg-white/10 mx-4" />
          <HUDParam label="LVL" value={userMetrics.level} />
       </div>

       {/* --- Top Left: Flight State --- */}
       {!isMobile && (
          <div className="absolute top-10 left-10 flex flex-col gap-1">
             <div className="text-[8px] font-mono text-[#00E5FF] tracking-[0.5em] uppercase">Telemetry_Feed</div>
             <div className="text-xl font-bold tracking-tighter italic text-white/40 capitalize">
                SKYHIGH // {AIRCRAFT_MODELS.find(a => a.id === useGameStore.getState().selectedAircraftId)?.name}
             </div>
          </div>
       )}

       {/* --- Mission Overlay --- */}
       {mission.activeId && activeDef && (
          <div className="absolute top-24 left-10 max-w-xs p-4 bg-black/20 border-l-2 border-[#00E5FF]">
             <div className="text-[10px] font-bold text-[#00E5FF] uppercase mb-1">Active Mission: {activeDef.title}</div>
             <p className="text-[9px] text-white/60 leading-tight uppercase font-mono">{activeDef.description}</p>
             <div className="mt-4 h-1 w-full bg-white/5 overflow-hidden">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${mission.progress}%` }}
                  className="h-full bg-[#00E5FF]"
                />
             </div>
          </div>
       )}

       {/* Mobile Controls Overlay */}
       {isMobile && (
          <div className="absolute inset-0 pointer-events-none">
             <div className="absolute bottom-20 left-10 flex flex-col gap-4 pointer-events-auto">
                <button 
                   onPointerDown={() => handleThrottleChange(5)}
                   className="w-14 h-14 bg-white/5 border border-white/10 rounded flex items-center justify-center active:bg-[#00E5FF] active:text-black transition-all"
                >
                   <ChevronUp size={24} />
                </button>
                <div className="h-32 w-4 bg-white/10 rounded-full mx-auto relative overflow-hidden">
                   <motion.div 
                      className="absolute bottom-0 inset-x-0 bg-[#00E5FF] shadow-[0_0_15px_#00E5FF]"
                      animate={{ height: `${telemetry.throttle * 100}%` }}
                   />
                </div>
                <button 
                   onPointerDown={() => handleThrottleChange(-5)}
                   className="w-14 h-14 bg-white/5 border border-white/10 rounded flex items-center justify-center active:bg-[#00E5FF] active:text-black transition-all"
                >
                   <ChevronDown size={24} />
                </button>
             </div>

             <div className="absolute bottom-20 right-10 flex flex-col gap-4 pointer-events-auto items-end">
                <div className="grid grid-cols-2 gap-3">
                   <ControlButton 
                      label="GEAR" 
                      active={telemetry.gearDown} 
                      onClick={() => updateTelemetry({ gearDown: !telemetry.gearDown })} 
                   />
                   <ControlButton 
                      label="FLAPS" 
                      active={telemetry.flaps > 0} 
                      onClick={() => updateTelemetry({ flaps: telemetry.flaps === 0 ? 10 : 0 })} 
                   />
                </div>
                
                <div className="w-40 h-40 bg-black/40 border border-[#00E5FF]/20 rounded-full flex items-center justify-center relative touch-none select-none">
                   <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <div className="w-[1px] h-full bg-[#00E5FF]" />
                      <div className="h-[1px] w-full bg-[#00E5FF]" />
                   </div>
                   <motion.div 
                     className="w-12 h-12 bg-[#00E5FF] rounded-full shadow-[0_0_20px_#00E5FF]"
                     animate={{
                        x: (telemetry.roll / 0.7) * 50,
                        y: (-telemetry.pitch / 0.5) * 50
                     }}
                   />
                </div>
             </div>

             <div className="absolute bottom-10 right-10 pointer-events-auto">
                <button 
                  className="px-6 py-2 bg-[#FF3D00] text-white text-[8px] font-black tracking-widest hover:opacity-90 active:scale-95 transition-all uppercase"
                  onClick={() => setPlaying(false)}
                >
                  Terminate
                </button>
             </div>
          </div>
       )}

       {/* Mission Result Overlay */}
       <AnimatePresence>
        {(mission.isCompleted || mission.isFailed) && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-auto bg-[#05070A]/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className={`w-full max-w-lg p-16 flex flex-col items-center gap-8 border bg-black/95 ${mission.isCompleted ? 'border-[#00E5FF]' : 'border-[#FF3D00]'}`}>
              {mission.isCompleted ? <CheckCircle size={80} className="text-[#38A169]" /> : <AlertTriangle size={80} className="text-[#FF3D00]" />}
              <div className="text-center">
                 <h2 className="text-5xl font-black tracking-[0.2em] text-white mb-2 uppercase italic">{mission.isCompleted ? 'Success' : 'Aborted'}</h2>
              </div>
              <button 
                onClick={() => setPlaying(false)}
                className={`w-full py-4 font-black tracking-[0.4em] transition-all uppercase text-[10px] ${mission.isCompleted ? 'bg-[#00E5FF] text-black' : 'bg-[#FF3D00] text-white'}`}
              >
                Return to Command
              </button>
            </div>
          </motion.div>
        )}
       </AnimatePresence>
    </div>
  );
}

function ControlButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
   return (
      <button 
         onClick={onClick}
         className={`px-4 py-3 rounded border font-bold text-[8px] tracking-widest transition-all pointer-events-auto ${active ? 'bg-[#00E5FF] text-black border-[#00E5FF]' : 'bg-white/5 text-white/40 border-white/10'}`}
      >
         {label}
      </button>
   );
}

function SystemIndicator({ label, value, active = false, warning = false }: { label: string; value: string; active?: boolean; warning?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
       <span className="text-[7px] text-white/30 uppercase tracking-[0.15em] font-bold">{label}</span>
       <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full ${active ? (warning ? 'bg-[#FF3D00] animate-pulse' : 'bg-[#00E5FF]') : 'bg-white/5'}`} />
          <span className={`text-[11px] font-bold tracking-tight ${warning ? 'text-[#FF3D00]' : 'text-white'}`}>{value}</span>
       </div>
    </div>
  );
}

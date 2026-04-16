import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Navigation, Fuel, Wind, Gauge, Compass, Trophy, Timer, CheckCircle, AlertTriangle, ChevronUp, ChevronDown, RotateCcw, Box } from 'lucide-react';
import { MISSIONS } from '../lib/constants';
import { useEffect, useState } from 'react';

export function HUD() {
  const telemetry = useGameStore((state) => state.telemetry);
  const isPlaying = useGameStore((state) => state.isPlaying);
  const mission = useGameStore((state) => state.mission);
  const setPlaying = useGameStore((state) => state.setPlaying);
  const updateTelemetry = useGameStore((state) => state.updateTelemetry);

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
    const newThrottle = Math.max(0, Math.min(100, telemetry.throttle + delta));
    updateTelemetry({ throttle: newThrottle });
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between font-mono text-[9px] tracking-tight text-[#00E5FF] select-none overflow-hidden">
      {/* Top Header Grid */}
      <div className="flex justify-between items-start">
         <div className="flex flex-col gap-1 backdrop-blur-md bg-black/40 p-3 border-l-2 border-[#00E5FF]">
            <div className="flex items-center gap-2">
               <span className="font-bold text-white tracking-[0.2em] text-[8px] sm:text-[10px]">SKY_COMMAND_OS</span>
               <span className="px-1.5 py-0.5 bg-[#00E5FF] text-black font-black text-[6px] sm:text-[7px] rounded-[2px]">MOBILE_ACTIVE</span>
            </div>
            <div className="hidden sm:flex gap-4 opacity-60">
               <span>PITCH: {telemetry.pitch.toFixed(1)}°</span>
               <span>ROLL: {telemetry.roll.toFixed(1)}°</span>
               <span>HDG: {telemetry.yaw.toFixed(1)}°</span>
            </div>
         </div>

         {activeDef && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 sm:gap-8 px-4 sm:px-6 py-2 bg-black/60 border border-[#00E5FF]/20 backdrop-blur-xl rounded-sm pointer-events-auto"
            >
               <div className="flex flex-col">
                  <span className="text-[6px] sm:text-[7px] text-white/40 uppercase tracking-widest mb-0.5 sm:mb-1">Protocol</span>
                  <span className="text-[9px] sm:text-[11px] font-bold text-white tracking-widest truncate max-w-[80px] sm:max-w-none">{activeDef.title}</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[9px] sm:text-[10px] text-[#FF3D00] font-bold tabular-nums">{mission.timeRemaining}S</span>
                  <div className="w-16 sm:w-24 h-1 bg-white/5 mt-1 relative overflow-hidden rounded-full">
                     <motion.div 
                        className="absolute inset-y-0 left-0 bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" 
                        animate={{ width: `${mission.progress}%` }} 
                     />
                  </div>
               </div>
            </motion.div>
         )}

         <div className="text-right backdrop-blur-md bg-black/40 p-3 border-r-2 border-[#00E5FF] hidden sm:block">
            <div className="text-white font-bold tracking-widest">NODE_04 // ACTIVE</div>
            <div className="opacity-40 font-mono text-[7px]">{new Date().toLocaleTimeString()}</div>
         </div>
      </div>

      {/* Main Flight Data Strips (Adapted for Mobile) */}
      <div className="flex justify-between items-center relative h-48 sm:h-64 mt-8">
         {/* Speed Tape */}
         <div className="w-16 sm:w-24 h-full flex flex-col justify-center items-center relative gap-1 sm:gap-2">
            <div className="text-2xl sm:text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(0,229,255,0.4)] tracking-tighter">{telemetry.speed}</div>
            <div className="text-[6px] sm:text-[8px] opacity-40">KNOTS</div>
         </div>

         {/* Center Pitch / Horizon */}
         <div className="relative flex-1 h-full flex items-center justify-center opacity-60 sm:opacity-80 pointer-events-none">
            <div className="absolute w-[150px] sm:w-[400px] h-[1px] bg-white/10" />
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-[1px] border-[#00E5FF] rounded-full flex items-center justify-center">
               <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full" />
            </div>
            <motion.div 
               className="absolute flex flex-col gap-8 sm:gap-10 items-center"
               animate={{ y: -telemetry.pitch * (isMobile ? 1.5 : 2.5), rotate: telemetry.roll }}
            >
               {[-20, -10, 0, 10, 20].map(p => (
                  <div key={p} className="flex items-center gap-2 sm:gap-4">
                     <div className={`h-[1px] bg-white/20 ${Math.abs(p) % 10 === 0 ? 'w-10 sm:w-16' : 'w-2 sm:w-4'}`} />
                     <span className="text-[6px] opacity-40 w-3 text-center">{p}</span>
                     <div className={`h-[1px] bg-white/20 ${Math.abs(p) % 10 === 0 ? 'w-10 sm:w-16' : 'w-2 sm:w-4'}`} />
                  </div>
               ))}
            </motion.div>
         </div>

         {/* Altitude Tape */}
         <div className="w-16 sm:w-24 h-full flex flex-col justify-center items-center relative gap-1 sm:gap-2">
            <div className="text-2xl sm:text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{(telemetry.altitude / 1000).toFixed(1)}</div>
            <div className="text-[6px] sm:text-[8px] opacity-40">FT_x1K</div>
         </div>
      </div>

      {/* Virtual Controls (Mobile Only) */}
      <AnimatePresence>
        {isMobile && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-end gap-4 px-4 pb-20 pointer-events-none"
          >
            {/* Left: Throttle Slider */}
            <div className="flex flex-col items-center gap-4 pointer-events-auto">
               <button 
                  onPointerDown={() => handleThrottleChange(5)}
                  className="w-14 h-14 bg-white/5 border border-white/10 rounded flex items-center justify-center active:bg-[#00E5FF] active:text-black transition-all"
               >
                  <ChevronUp size={24} />
               </button>
               <div className="h-32 w-4 bg-white/10 rounded-full relative overflow-hidden">
                  <motion.div 
                     className="absolute bottom-0 inset-x-0 bg-[#00E5FF] shadow-[0_0_15px_#00E5FF]"
                     animate={{ height: `${telemetry.throttle}%` }}
                  />
               </div>
               <button 
                  onPointerDown={() => handleThrottleChange(-5)}
                  className="w-14 h-14 bg-white/5 border border-white/10 rounded flex items-center justify-center active:bg-[#00E5FF] active:text-black transition-all"
               >
                  <ChevronDown size={24} />
               </button>
            </div>

            {/* Right: Pitch/Roll/Gear/Flaps Panel */}
            <div className="flex flex-col gap-4 pointer-events-auto items-end">
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
               
               {/* Virtual Joystick Base */}
               <div className="w-40 h-40 bg-black/40 border border-[#00E5FF]/20 rounded-full flex items-center justify-center relative touch-none select-none">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                     <div className="w-[1px] h-full bg-[#00E5FF]" />
                     <div className="h-[1px] w-full bg-[#00E5FF]" />
                  </div>
                  <motion.div 
                    className="w-12 h-12 bg-[#00E5FF] rounded-full shadow-[0_0_20px_#00E5FF]"
                    animate={{
                       x: (telemetry.roll / 45) * 50,
                       y: (-telemetry.pitch / 25) * 50
                    }}
                  />
                  <div className="absolute -bottom-8 text-[7px] text-white/40 tracking-[0.2em] font-bold">PITCH_ROLL_ZONE</div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer System Tray (Desktop Inspired) */}
      <div className="flex justify-between items-end backdrop-blur-2xl bg-black/60 p-4 sm:p-5 border border-white/5 mb-0 sm:mb-4 rounded-sm shadow-2xl pointer-events-auto">
         <div className="hidden sm:flex gap-12">
            <SystemIndicator label="FWD_THROTTLE" value={`${telemetry.throttle}%`} active />
            <SystemIndicator label="GEAR" value={telemetry.gearDown ? "DOWN_LOCKED" : "RETRACTED"} active={telemetry.gearDown} />
            <SystemIndicator label="FLAPS" value={`${telemetry.flaps}°`} active={telemetry.flaps > 0} />
            <SystemIndicator label="AIR_FUEL" value={`${telemetry.fuel}%`} warning={telemetry.fuel < 20} active />
         </div>

         {/* Mobile Stat Bar (Visible on mobile instead of full tray info) */}
         {isMobile && (
            <div className="flex gap-4 sm:hidden">
               <div className="flex flex-col">
                  <span className="text-[6px] opacity-40">THROTTLE</span>
                  <span className="text-[10px] font-bold text-white">{telemetry.throttle}%</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[6px] opacity-40">FUEL</span>
                  <span className={`text-[10px] font-bold ${telemetry.fuel < 20 ? 'text-[#FF3D00]' : 'text-[#00E5FF]'}`}>{telemetry.fuel}%</span>
               </div>
            </div>
         )}

         <div className="flex gap-2 sm:gap-4 p-1 bg-black/20 rounded border border-white/5">
            <button 
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#FF3D00] text-white text-[7px] sm:text-[8px] tracking-[0.2em] font-black hover:opacity-90 active:scale-95 transition-all uppercase"
              onClick={() => setPlaying(false)}
            >
              Logoff
            </button>
         </div>
      </div>

      {/* Mission Modals (Mobile Friendly) */}
      <AnimatePresence>
        {(mission.isCompleted || mission.isFailed) && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-auto bg-[#05070A]/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className={`w-full max-w-lg glass-panel p-8 sm:p-16 flex flex-col items-center gap-6 sm:gap-8 border ${mission.isCompleted ? 'border-[#00E5FF]' : 'border-[#FF3D00]'} shadow-2xl bg-black/95`}>
              {mission.isCompleted ? <CheckCircle size={60} className="text-[#38A169] sm:w-[80px] sm:h-[80px]" /> : <AlertTriangle size={60} className="text-[#FF3D00] sm:w-[80px] sm:h-[80px]" />}
              <div className="text-center">
                 <h2 className="text-2xl sm:text-5xl font-black tracking-[0.2em] text-white mb-2 uppercase italic">{mission.isCompleted ? 'Success' : 'Aborted'}</h2>
                 <p className="opacity-40 font-mono text-[8px] sm:text-[10px] tracking-widest uppercase">{mission.isCompleted ? 'Registry Updated' : 'System Critical'}</p>
              </div>
              <button 
                onClick={() => setPlaying(false)}
                className={`w-full py-4 ${mission.isCompleted ? 'bg-[#00E5FF] text-black' : 'bg-[#FF3D00] text-white'} font-black tracking-[0.4em] rounded-[2px] hover:opacity-80 transition-all uppercase text-[10px]`}
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
         className={`px-4 py-3 rounded border font-bold text-[8px] tracking-widest transition-all ${active ? 'bg-[#00E5FF] text-black border-[#00E5FF]' : 'bg-white/5 text-white/40 border-white/10'}`}
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

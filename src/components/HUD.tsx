import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Navigation, Fuel, Wind, Gauge, Compass, Trophy, Timer, CheckCircle, AlertTriangle } from 'lucide-react';
import { MISSIONS } from '../lib/constants';

export function HUD() {
  const telemetry = useGameStore((state) => state.telemetry);
  const isPlaying = useGameStore((state) => state.isPlaying);
  const mission = useGameStore((state) => state.mission);
  const setPlaying = useGameStore((state) => state.setPlaying);

  if (!isPlaying) return null;

  const activeDef = MISSIONS.find(m => m.id === mission.activeId);

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between font-mono text-[9px] tracking-tight text-[#00E5FF] select-none">
      {/* Top Header Grid */}
      <div className="flex justify-between items-start">
         <div className="flex flex-col gap-1 backdrop-blur-md bg-black/40 p-3 border-l-2 border-[#00E5FF]">
            <div className="flex items-center gap-2">
               <span className="font-bold text-white tracking-[0.2em]">SKY_COMMAND_OS</span>
               <span className="px-1.5 py-0.5 bg-[#00E5FF] text-black font-black text-[7px] rounded-[2px]">BETA</span>
            </div>
            <div className="flex gap-4 opacity-60">
               <span>PITCH: {telemetry.pitch}°</span>
               <span>ROLL: {telemetry.roll}°</span>
               <span>HDG: {telemetry.yaw}°</span>
            </div>
         </div>

         {activeDef && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-8 px-6 py-2 bg-black/60 border border-white/5 backdrop-blur-xl rounded-sm pointer-events-auto"
            >
               <div className="flex flex-col">
                  <span className="text-[7px] text-white/40 uppercase tracking-widest mb-1">Active Objective</span>
                  <span className="text-[11px] font-bold text-white tracking-widest">{activeDef.title}</span>
               </div>
               <div className="h-6 w-[1px] bg-white/10" />
               <div className="flex flex-col items-end">
                  <span className="text-[10px] text-[#FF3D00] font-bold tabular-nums">T-MINUS {mission.timeRemaining}S</span>
                  <div className="w-24 h-1 bg-white/5 mt-1 relative overflow-hidden">
                     <motion.div 
                       className="absolute inset-y-0 left-0 bg-[#00E5FF]" 
                       animate={{ width: `${mission.progress}%` }} 
                     />
                  </div>
               </div>
            </motion.div>
         )}

         <div className="text-right backdrop-blur-md bg-black/40 p-3 border-r-2 border-[#00E5FF]">
            <div className="text-white font-bold tracking-widest">NODE_04 // ACTIVE</div>
            <div className="opacity-40">{new Date().toLocaleTimeString()}</div>
         </div>
      </div>

      {/* Main Flight Data Strips */}
      <div className="flex justify-between items-center mb-16 relative h-64">
         {/* Speed Tape */}
         <div className="w-24 h-full flex flex-col justify-center items-center relative gap-2">
            <div className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(0,229,255,0.4)] tracking-tighter">{telemetry.speed}</div>
            <div className="text-[8px] opacity-40">KNOTS_IAS</div>
            <div className="absolute -left-4 inset-y-0 w-[1px] bg-gradient-to-b from-transparent via-[#00E5FF]/40 to-transparent" />
         </div>

         {/* Center Pitch / Horizon */}
         <div className="relative flex-1 h-full flex items-center justify-center opacity-80 pointer-events-none">
            {/* Horizontal Line */}
            <div className="absolute w-[400px] h-[1px] bg-white/10" />
            
            {/* Target Reticle */}
            <div className="w-8 h-8 border-[1px] border-[#00E5FF] rounded-full flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </div>

            {/* Pitch Ladder */}
            <motion.div 
               className="absolute flex flex-col gap-10 items-center"
               animate={{ y: -telemetry.pitch * 2.5 }}
            >
               {[-20, -10, 0, 10, 20].map(p => (
                  <div key={p} className="flex items-center gap-4">
                     <div className={`h-[1px] bg-white/20 ${Math.abs(p) % 10 === 0 ? 'w-16' : 'w-4'}`} />
                     <span className="text-[7px] opacity-40 w-4 text-center">{p}</span>
                     <div className={`h-[1px] bg-white/20 ${Math.abs(p) % 10 === 0 ? 'w-16' : 'w-4'}`} />
                  </div>
               ))}
            </motion.div>
         </div>

         {/* Altitude Tape */}
         <div className="w-24 h-full flex flex-col justify-center items-center relative gap-2">
            <div className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{(telemetry.altitude / 1000).toFixed(1)}</div>
            <div className="text-[8px] opacity-40">FT_MSL_x1K</div>
            <div className="absolute -right-4 inset-y-0 w-[1px] bg-gradient-to-b from-transparent via-[#00E5FF]/40 to-transparent" />
         </div>
      </div>

      {/* Footer System Tray */}
      <div className="flex justify-between items-end backdrop-blur-2xl bg-black/60 p-5 border border-white/5 mb-4 rounded-sm shadow-2xl">
         <div className="flex gap-12">
            <SystemIndicator label="FWD_THROTTLE" value={`${telemetry.throttle}%`} active />
            <SystemIndicator label="GEAR" value={telemetry.gearDown ? "DOWN_LOCKED" : "RETRACTED"} active={telemetry.gearDown} />
            <SystemIndicator label="FLAPS" value={`${telemetry.flaps}°`} active={telemetry.flaps > 0} />
            <SystemIndicator label="AIR_FUEL" value={`${telemetry.fuel}%`} warning={telemetry.fuel < 20} active />
         </div>

         <div className="flex gap-4 p-1 bg-black/40 rounded border border-white/5 pointer-events-auto">
            <button className="px-6 py-2.5 hover:bg-white/5 text-[8px] tracking-[0.2em] transition-colors border-r border-white/5 font-bold">DIAGNOSTICS_SYS</button>
            <button 
              className="px-6 py-2.5 bg-[#FF3D00] text-white text-[8px] tracking-[0.2em] font-black hover:opacity-90 active:scale-95 transition-all"
              onClick={() => setPlaying(false)}
            >
              TERMINATE_SIM
            </button>
         </div>
      </div>

      <AnimatePresence>
        {mission.isCompleted && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
          >
            <div className="glass-panel p-16 flex flex-col items-center gap-8 border-[#00E5FF] shadow-[0_0_100px_rgba(0,229,255,0.15)] bg-black/90 backdrop-blur-3xl">
              <CheckCircle size={80} className="text-[#38A169]" />
              <div className="text-center">
                 <h2 className="text-5xl font-black tracking-[0.3em] text-white mb-3">MISSION_COMPLETE</h2>
                 <p className="opacity-40 font-mono text-[10px] tracking-widest uppercase">Protocol Secured // Registry Updated</p>
              </div>
              <button 
                onClick={() => setPlaying(false)}
                className="w-full py-4 bg-[#00E5FF] text-black font-black tracking-[0.4em] rounded-[2px] hover:bg-[#00E5FF]/80 transition-all uppercase text-xs"
              >
                Return to Command
              </button>
            </div>
          </motion.div>
        )}

        {mission.isFailed && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
          >
            <div className="glass-panel p-16 flex flex-col items-center gap-8 border-[#FF3D00] shadow-[0_0_100px_rgba(255,61,0,0.15)] bg-black/90 backdrop-blur-3xl">
              <AlertTriangle size={80} className="text-[#FF3D00]" />
              <div className="text-center">
                 <h2 className="text-5xl font-black tracking-[0.3em] text-white mb-3">MISSION_ABORTED</h2>
                 <p className="opacity-40 text-[#FF3D00] font-mono text-[10px] tracking-widest uppercase">System Critical // Manual Reset Required</p>
              </div>
              <button 
                onClick={() => setPlaying(false)}
                className="w-full py-4 bg-[#FF3D00] text-white font-black tracking-[0.4em] rounded-[2px] hover:bg-[#FF3D00]/80 transition-all uppercase text-xs"
              >
                Recalibrate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

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
    <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between font-mono text-[10px] uppercase tracking-wider text-[#00E5FF] select-none">
      {/* Top Bar Navigation Look */}
      <div className="absolute top-0 inset-x-0 h-16 bg-black/80 border-b border-[#00E5FF]/20 px-8 flex items-center justify-between z-10">
        <div className="flex flex-col">
          <span className="text-[10px] tracking-widest font-bold text-[#F8FAFC]">Simulation Pilot Pro X</span>
          <span className="text-[8px] opacity-60">System Version 1.0.42 // Sector A-9</span>
        </div>

        {/* Dynamic Mission HUD Area */}
        <AnimatePresence mode="wait">
          {activeDef ? (
             <motion.div 
               key="mission-hud"
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="flex items-center gap-6 px-6 h-10 border border-[#00E5FF]/30 bg-[#00E5FF]/5 rounded"
             >
                <div className="flex items-center gap-2">
                   <Trophy size={14} />
                   <span className="font-bold text-[#F8FAFC]">{activeDef.title}</span>
                </div>
                <div className="w-[1px] h-4 bg-[#00E5FF]/20" />
                <div className="flex items-center gap-2">
                   <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[#00E5FF]" 
                        animate={{ width: `${mission.progress}%` }} 
                      />
                   </div>
                   <span className="text-[8px]">PROG: {Math.round(mission.progress)}%</span>
                </div>
                <div className="w-[1px] h-4 bg-[#00E5FF]/20" />
                <div className="flex items-center gap-2 text-[#FF3D00]">
                   <Timer size={14} />
                   <span className="font-bold">{mission.timeRemaining}s</span>
                </div>
             </motion.div>
          ) : (
            <div className="px-4 py-1.5 border border-[#FF3D00] bg-[#FF3D00]/10 text-[#FF3D00] font-bold text-[9px] tracking-widest">
               Status: Free Flight Active
            </div>
          )}
        </AnimatePresence>

        <div className="text-right flex flex-col">
          <span className="text-[9px] text-[#00E5FF]">WIND: 12KTS SE</span>
          <span className="text-[8px] opacity-40">VIS: 10NM // TEMP: 14°C</span>
        </div>
      </div>

      {mission.isCompleted && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
        >
          <div className="glass-panel p-12 flex flex-col items-center gap-6 border-[#00E5FF] shadow-[0_0_50px_rgba(0,229,255,0.2)]">
            <CheckCircle size={64} className="text-[#38A169]" />
            <div className="text-center">
               <h2 className="text-4xl font-black tracking-widest text-[#F8FAFC] mb-2">MISSION COMPLETE</h2>
               <p className="opacity-60">Objective Secured // Reward Claimed</p>
            </div>
            <button 
              onClick={() => setPlaying(false)}
              className="px-8 py-3 bg-[#00E5FF] text-black font-bold tracking-widest rounded hover:bg-[#00E5FF]/80 transition-all"
            >
              RETURN TO BASE
            </button>
          </div>
        </motion.div>
      )}

      {mission.isFailed && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
        >
          <div className="glass-panel p-12 flex flex-col items-center gap-6 border-[#FF3D00] shadow-[0_0_50px_rgba(255,61,0,0.2)]">
            <AlertTriangle size={64} className="text-[#FF3D00]" />
            <div className="text-center">
               <h2 className="text-4xl font-black tracking-widest text-[#F8FAFC] mb-2">MISSION FAILED</h2>
               <p className="opacity-60 text-[#FF3D00]">Target Lost // Mission Aborted</p>
            </div>
            <button 
              onClick={() => setPlaying(false)}
              className="px-8 py-3 bg-[#FF3D00] text-white font-bold tracking-widest rounded hover:bg-[#FF3D00]/80 transition-all"
            >
              RETRY OPERATIONS
            </button>
          </div>
        </motion.div>
      )}

      {/* Center Section - HUD Target / Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] border border-[#00E5FF]/20 rounded-sm flex items-center justify-center pointer-events-none">
        {/* Horizon Line */}
        <div className="absolute top-1/2 inset-x-0 h-[1px] bg-[#00E5FF]/30 shadow-[0_0_15px_#00E5FF]" />
        
        {/* Pitch Ladder */}
        <div className="relative w-[150px] h-full flex flex-col justify-between items-center py-10 opacity-60">
           <motion.div 
              className="flex flex-col gap-12"
              animate={{ y: -telemetry.pitch * 3 }}
           >
              {[-20, -10, 0, 10, 20].map(p => (
                 <div key={p} className="flex flex-col items-center">
                    <div className={`h-[1px] bg-[#00E5FF] ${Math.abs(p) === 10 ? 'w-16' : 'w-10'}`} />
                    <span className="text-[8px] mt-1">{p}</span>
                 </div>
              ))}
           </motion.div>
        </div>

        {/* Static Center Crosshair */}
        <div className="absolute w-5 h-5 border-2 border-[#F8FAFC] rounded-full" />
      </div>

      {/* Instrument Strips (Staggered Sides) */}
      {/* Speedometer Left */}
      <div className="absolute left-12 top-1/2 -translate-y-1/2 w-20 h-[300px] glass-panel p-4 flex flex-col items-center">
        <div className="text-xl font-bold border-b border-[#00E5FF]/30 w-full text-center pb-2 mb-4">
          {telemetry.speed}
        </div>
        <div className="flex-1 flex flex-col justify-between items-end w-full opacity-40 text-[9px]">
           {[300, 250, 200, 150, 100, 50, 0].map(s => (
             <span key={s} className={telemetry.speed >= s && telemetry.speed < s + 50 ? 'text-[#00E5FF] font-bold' : ''}>
               {s}
             </span>
           ))}
        </div>
        <div className="mt-4 text-[8px] opacity-40">KNOTS</div>
      </div>

      {/* Altimeter Right */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 w-20 h-[300px] glass-panel p-4 flex flex-col items-center">
        <div className="text-xl font-bold border-b border-[#00E5FF]/30 w-full text-center pb-2 mb-4">
          {(telemetry.altitude / 1000).toFixed(1)}
        </div>
        <div className="flex-1 flex flex-col justify-between items-start w-full opacity-40 text-[9px]">
           {[30, 25, 20, 15, 10, 5, 0].map(a => (
             <span key={a} className={Math.floor(telemetry.altitude / 1000) === a ? 'text-[#00E5FF] font-bold' : ''}>
               {a}.0
             </span>
           ))}
        </div>
        <div className="mt-4 text-[8px] opacity-40">FT x1000</div>
      </div>

      {/* Bottom Console Controls */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-black/90 border-t border-[#00E5FF]/20 px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-6 w-1/3">
           <span className="text-[10px] font-bold">THROTTLE</span>
           <div className="flex-1 h-2 bg-[#1A202C] rounded-full relative">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-[#00E5FF] rounded-full"
                animate={{ width: `${telemetry.throttle}%` }}
              />
              <motion.div 
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-[#F8FAFC] rounded-sm -ml-2.5"
                animate={{ left: `${telemetry.throttle}%` }}
              />
           </div>
           <span className="text-lg font-bold min-w-[50px]">{telemetry.throttle}%</span>
        </div>

        <div className="flex items-center gap-8 justify-center">
           <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-6 bg-[#38A169] rounded-full relative cursor-pointer">
                 <div className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full" />
              </div>
              <span className="text-[8px] opacity-60">ENG MASTER</span>
           </div>
           <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${telemetry.gearDown ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-[#64748B] text-[#64748B]'}`}>
                G
              </div>
              <span className="text-[8px] opacity-60">{telemetry.gearDown ? 'GEAR DOWN' : 'GEAR UP'}</span>
           </div>
           <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded border border-[#64748B] flex items-center justify-center text-xs text-[#64748B]">
                F2
              </div>
              <span className="text-[8px] opacity-60">FLAPS 15°</span>
           </div>
        </div>

        <div className="w-1/3 flex justify-end gap-2">
           <div className="text-right mr-4">
              <span className="text-[8px] opacity-40 block mb-1">CAMERA MODE</span>
              <div className="flex gap-1">
                <button className="px-3 py-1.5 glass-panel text-[8px] border-[#00E5FF]/40 text-[#00E5FF]">COCKPIT</button>
                <button className="px-3 py-1.5 bg-[#00E5FF] text-black text-[8px] font-bold rounded-sm">THIRD PERSON</button>
              </div>
           </div>
        </div>
      </div>

      {/* Sidebar Stats Tooltip Look */}
      <div className="absolute left-8 top-24 w-48 flex flex-col gap-3">
         <div className="glass-panel p-4 flex flex-col gap-3">
            <span className="text-[8px] text-[#64748B]">System Health</span>
            <div className="flex flex-col gap-1">
               <div className="flex justify-between text-[9px]">
                  <span>Eng 1 Temp</span>
                  <span className="text-[#00E5FF]">450°C</span>
               </div>
               <div className="h-1 bg-[#2D3748] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00E5FF]" style={{ width: '65%' }} />
               </div>
            </div>
            <div className="flex flex-col gap-1">
               <div className="flex justify-between text-[9px]">
                  <span>Oil Pressure</span>
                  <span className="text-[#00E5FF]">94 PSI</span>
               </div>
               <div className="h-1 bg-[#2D3748] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00E5FF]" style={{ width: '88%' }} />
               </div>
            </div>
         </div>

         <div className="glass-panel p-4 flex flex-col gap-3">
            <span className="text-[8px] text-[#64748B]">Fuel Reserves</span>
            <div className="flex justify-between text-[9px]">
               <span>Level</span>
               <span className="text-yellow-400">{telemetry.fuel}%</span>
            </div>
            <div className="h-1 bg-[#2D3748] rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-yellow-400" 
                 animate={{ width: `${telemetry.fuel}%` }}
               />
            </div>
            <span className="text-[8px] opacity-40">EST. RANGE: 420 NM</span>
         </div>
      </div>
    </div>
  );
}

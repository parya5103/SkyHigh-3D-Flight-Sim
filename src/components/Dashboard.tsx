import { useGameStore } from '../store/gameStore';
import { CITIES, MISSIONS, AIRCRAFT_MODELS } from '../lib/constants';
import { MapPin, Plane, Play, Globe, Settings, Users, Navigation, Trophy, Package, LifeBuoy, Rocket, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export function Dashboard() {
  const isPlaying = useGameStore((state) => state.isPlaying);
  const selectedCity = useGameStore((state) => state.selectedCity);
  const selectedAircraftId = useGameStore((state) => state.selectedAircraftId);
  const activeMissionId = useGameStore((state) => state.mission.activeId);
  const user = useGameStore((state) => state.user);

  const setCity = useGameStore((state) => state.setCity);
  const setAircraft = useGameStore((state) => state.setAircraft);
  const setPlaying = useGameStore((state) => state.setPlaying);
  const startMission = useGameStore((state) => state.startMission);

  const userMetrics = useGameStore((state) => state.userMetrics);
  const [activeTab, setActiveTab] = useState<'cities' | 'missions' | 'aircraft' | 'store'>('cities');

  if (isPlaying) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#05070A] text-[#F8FAFC] font-sans overflow-hidden">
      {/* Background Graphic (MSFS Ambience) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070A] via-transparent to-[#05070A] z-10" />
        <img 
          src={`https://picsum.photos/seed/flight-sim-12/1920/1080?blur=10`} 
          className="w-full h-full object-cover grayscale" 
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative h-full flex flex-col z-20">
        {/* Top Precision Bar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-black/40 backdrop-blur-xl">
           <div className="flex items-center gap-12">
              <div className="flex flex-col">
                 <h1 className="text-xl font-bold tracking-[0.3em] uppercase italic text-white">SKYHIGH_SIM</h1>
                 <span className="text-[9px] font-mono text-[#00E5FF] tracking-widest opacity-60">GLOBAL_OPERATIONS_CENTER // v4.0.2</span>
              </div>
              
              <nav className="flex gap-8">
                 <TopNavLink active={activeTab === 'cities'} label="World Map" onClick={() => setActiveTab('cities')} />
                 <TopNavLink active={activeTab === 'aircraft'} label="Hangar" onClick={() => setActiveTab('aircraft')} />
                 <TopNavLink active={activeTab === 'missions'} label="Activities" onClick={() => setActiveTab('missions')} />
                 <TopNavLink active={activeTab === 'store'} label="Marketplace" onClick={() => setActiveTab('store')} />
              </nav>
           </div>
           
           <div className="flex items-center gap-12">
              <div className="flex gap-8">
                 <HeaderMetric label="RANK" value={`LVL ${userMetrics.level}`} />
                 <HeaderMetric label="BALANCE" value={`${userMetrics.credits.toLocaleString()} CR`} />
              </div>
              
              <div className="flex items-center gap-4 border-l border-white/10 pl-12">
                 <div className="text-right">
                    <div className="text-[10px] font-bold text-white uppercase">{user?.displayName || 'Ghost Pilot'}</div>
                    <div className="text-[8px] font-mono text-white/40 uppercase tracking-tighter">Status: Authorized</div>
                 </div>
                 <div className="w-10 h-10 rounded-full border border-[#00E5FF]/40 bg-[#00E5FF]/10 flex items-center justify-center">
                    <Users size={18} className="text-[#00E5FF]" />
                 </div>
              </div>
           </div>
        </header>

        {/* Dynamic Main Content */}
        <main className="flex-1 flex overflow-hidden">
           {/* Left Pane: Visual Info / Map */}
           <div className="w-1/2 p-20 flex flex-col justify-end relative">
              <AnimatePresence mode="wait">
                 {activeTab === 'cities' && selectedCity && (
                   <motion.div 
                     key="city-info"
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="max-w-md"
                   >
                      <h2 className="text-7xl font-black italic tracking-tighter uppercase mb-2">{selectedCity.name}</h2>
                      <div className="flex items-center gap-4 text-[#00E5FF] font-mono text-xs tracking-widest uppercase mb-8">
                         <MapPin size={14} />
                         <span>{selectedCity.lat.toFixed(4)}N / {selectedCity.lng.toFixed(4)}W</span>
                      </div>
                      <p className="text-white/40 text-sm leading-relaxed mb-12">
                         Operational sector confirmed. Regional weather data synced via satellite telemetry. 
                         Ready for immediate deployment into high-fidelity geographical mapping.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 border border-white/5 bg-white/5">
                            <div className="text-[8px] uppercase tracking-widest text-[#00E5FF] mb-1">Elevation</div>
                            <div className="text-xl font-bold uppercase">{(selectedCity as any).elevation}M MSL</div>
                         </div>
                         <div className="p-4 border border-white/5 bg-white/5">
                            <div className="text-[8px] uppercase tracking-widest text-[#00E5FF] mb-1">Local Time</div>
                            <div className="text-xl font-bold uppercase">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                         </div>
                      </div>
                   </motion.div>
                 )}

                 {activeTab === 'aircraft' && (
                   <motion.div 
                     key="aircraft-info"
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="max-w-md"
                   >
                      <h2 className="text-7xl font-black italic tracking-tighter uppercase mb-2">Hangar</h2>
                      <div className="text-[#00E5FF] font-mono text-xs tracking-widest uppercase mb-8">
                         Fleet Management System // Service Phase
                      </div>
                      <p className="text-white/40 text-sm leading-relaxed mb-12">
                         Select your vessel for the upcoming operation. All aircraft are pre-flight checked and fueled 
                         according to simulation parameters.
                      </p>
                      <div className="w-full aspect-video bg-white/5 border border-white/5 relative overflow-hidden flex items-center justify-center p-12">
                         <img 
                           src={`https://picsum.photos/seed/${selectedAircraftId}/800/600`} 
                           className="w-full h-full object-contain mix-blend-lighten" 
                           referrerPolicy="no-referrer"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Right Pane: Controls / Lists */}
           <div className="w-1/2 bg-black/40 backdrop-blur-3xl border-l border-white/5 flex flex-col">
              <div className="flex-1 overflow-y-auto p-12">
                 {activeTab === 'cities' && (
                    <div className="grid grid-cols-1 gap-2">
                       {CITIES.map((city) => (
                          <button
                             key={city.name}
                             onClick={() => setCity(city)}
                             className={`group flex items-center justify-between p-6 transition-all duration-300 ${
                                selectedCity?.name === city.name ? 'bg-[#00E5FF] text-black' : 'hover:bg-white/5 text-white/60 hover:text-white'
                             }`}
                          >
                             <div className="flex flex-col items-start">
                                <span className={`text-[9px] font-mono uppercase tracking-widest ${selectedCity?.name === city.name ? 'text-black/60' : 'text-[#00E5FF]'}`}>Sector Code_{city.name.substring(0, 3).toUpperCase()}</span>
                                <h3 className="text-xl font-bold uppercase tracking-tight">{city.name}</h3>
                             </div>
                             <div className="flex items-center gap-4">
                                <span className="text-[10px] font-mono opacity-40">{city.lat.toFixed(2)}N</span>
                                <Navigation size={20} className={selectedCity?.name === city.name ? 'rotate-45' : 'opacity-20'} />
                             </div>
                          </button>
                       ))}
                    </div>
                 )}

                 {activeTab === 'aircraft' && (
                    <div className="grid grid-cols-1 gap-3">
                       {AIRCRAFT_MODELS.map((aircraft) => (
                          <button
                             key={aircraft.id}
                             onClick={() => setAircraft(aircraft.id)}
                             className={`group flex items-center gap-6 p-6 border transition-all duration-300 text-left ${
                                selectedAircraftId === aircraft.id ? 'border-[#00E5FF] bg-[#00E5FF]/5' : 'border-white/5 hover:border-white/20'
                             }`}
                          >
                             <div className="w-20 h-12 bg-white/5 flex items-center justify-center">
                                <Plane size={24} className={selectedAircraftId === aircraft.id ? 'text-[#00E5FF]' : 'opacity-10'} />
                             </div>
                             <div className="flex-1">
                                <h3 className="text-lg font-bold uppercase tracking-tight">{aircraft.name}</h3>
                                <div className="flex gap-4 mt-1">
                                   <AircraftStat label="SPE" value={aircraft.stats.speed} />
                                   <AircraftStat label="AGI" value={aircraft.stats.agility} />
                                </div>
                             </div>
                             {selectedAircraftId === aircraft.id && <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />}
                          </button>
                       ))}
                    </div>
                 )}

                 {activeTab === 'missions' && (
                    <div className="space-y-4">
                       {MISSIONS.map((mission) => (
                          <button
                             key={mission.id}
                             onClick={() => {
                                startMission(mission.id);
                                if (!selectedCity) setCity(CITIES[0]);
                             }}
                             className={`group block w-full text-left p-8 border border-white/5 hover:border-[#00E5FF]/40 transition-all ${
                                activeMissionId === mission.id ? 'bg-[#00E5FF]/5 border-[#00E5FF]/40' : 'hover:bg-white/5'
                             }`}
                          >
                             <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{mission.title}</h3>
                                <span className="text-[10px] px-2 py-0.5 bg-white/10 text-white font-mono">{mission.type}</span>
                             </div>
                             <p className="text-white/40 text-xs mb-8 line-clamp-2">{mission.description}</p>
                             <div className="flex justify-between items-end">
                                <div className="flex gap-12">
                                   <div className="flex flex-col">
                                      <span className="text-[8px] text-[#00E5FF] uppercase tracking-widest mb-1">Reward</span>
                                      <span className="text-lg font-bold">{mission.reward} CR</span>
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-[8px] text-[#00E5FF] uppercase tracking-widest mb-1">Time Limit</span>
                                      <span className="text-lg font-bold">{mission.timeLimit}S</span>
                                   </div>
                                </div>
                                <div className="p-3 bg-white/5 group-hover:bg-[#00E5FF] group-hover:text-black transition-colors rounded-full">
                                   <Play size={16} fill="currentColor" />
                                </div>
                             </div>
                          </button>
                       ))}
                    </div>
                 )}
              </div>

              {/* Bottom Action Pane */}
              <div className="h-40 p-12 border-t border-white/5 bg-black/20 flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-[#00E5FF] uppercase tracking-widest mb-1">Pre-Flight Summary</span>
                    <div className="flex gap-6 items-baseline">
                       <span className="text-2xl font-bold uppercase">{selectedCity?.name || "No Sector Selected"}</span>
                       <span className="text-sm opacity-40 font-mono">/</span>
                       <span className="text-sm opacity-40 uppercase">{AIRCRAFT_MODELS.find(a => a.id === selectedAircraftId)?.name}</span>
                    </div>
                 </div>

                 <button
                    disabled={!selectedCity}
                    onClick={() => setPlaying(true)}
                    className="group relative h-16 px-12 bg-white text-black font-black uppercase tracking-[0.4em] italic text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-20 disabled:grayscale overflow-hidden"
                 >
                    <div className="relative z-10 flex items-center gap-4">
                       Fly Now <Play size={16} fill="currentColor" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-[#00E5FF]" />
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-[#00E5FF] translate-y-full group-hover:translate-y-[90%] transition-transform opacity-30 blur-xl" />
                 </button>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}

function TopNavLink({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`h-full flex flex-col justify-center relative transition-all group ${active ? 'text-white' : 'text-white/40 hover:text-white'}`}
    >
       <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
       {active && (
          <motion.div 
            layoutId="nav-underline" 
            className="absolute bottom-0 inset-x-0 h-1 bg-[#00E5FF] shadow-[0_0_15px_#00E5FF]" 
          />
       )}
    </button>
  );
}

function NavButton({ icon, active = false, onClick }: { icon: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-12 h-12 flex items-center justify-center rounded transition-all duration-300 ${
       active ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20' : 'text-white/20 hover:text-white/60 hover:bg-white/5'
    }`}>
       {icon}
    </button>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline border-b border-[#00E5FF]/10 pb-2">
       <span className="text-[9px] uppercase tracking-widest text-[#64748B] font-mono">{label}</span>
       <span className="text-sm font-medium tracking-tight text-[#F8FAFC]">{value}</span>
    </div>
  );
}

function AircraftStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 items-center">
       <span className="text-[8px] opacity-40 font-mono tracking-tighter">{label}</span>
       <span className="text-[10px] font-bold text-[#00E5FF]">{value}</span>
    </div>
  );
}

function Check({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
       <span className="text-[8px] text-[#00E5FF] uppercase tracking-[0.2em] font-bold opacity-40">{label}</span>
       <span className="text-sm font-black text-white tabular-nums tracking-wider">{value}</span>
    </div>
  );
}

function StoreCard({ title, desc, price, icon }: { title: string; desc: string; price: string; icon: React.ReactNode }) {
  return (
    <div className="glass-panel p-6 flex flex-col gap-4 border-white/5 hover:border-[#00E5FF]/40 transition-all group">
       <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center text-xl">
          {icon}
       </div>
       <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">{title}</h3>
          <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2">{desc}</p>
       </div>
       <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
          <span className="text-[10px] font-mono text-[#00E5FF]">{price}</span>
          <button className="px-4 py-1.5 bg-white/5 hover:bg-[#00E5FF] hover:text-black transition-all text-[9px] font-bold uppercase tracking-widest rounded-sm">Acquire</button>
       </div>
    </div>
  );
}

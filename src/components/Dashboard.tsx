import { useGameStore } from '../store/gameStore';
import { CITIES, MISSIONS, AIRCRAFT_MODELS } from '../lib/constants';
import { MapPin, Plane, Play, Globe, Settings, Users, Navigation, Trophy, Package, LifeBuoy, Rocket, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function Dashboard() {
  const isPlaying = useGameStore((state) => state.isPlaying);
  const selectedCity = useGameStore((state) => state.selectedCity);
  const selectedAircraftId = useGameStore((state) => state.selectedAircraftId);
  const activeMissionId = useGameStore((state) => state.mission.activeId);
  const setCity = useGameStore((state) => state.setCity);
  const setAircraft = useGameStore((state) => state.setAircraft);
  const setPlaying = useGameStore((state) => state.setPlaying);
  const startMission = useGameStore((state) => state.startMission);

  const userMetrics = useGameStore((state) => state.userMetrics);
  const [activeTab, setActiveTab] = useState<'cities' | 'missions' | 'aircraft' | 'store'>('cities');

  if (isPlaying) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#05070A] text-[#F8FAFC] font-sans selection:bg-[#00E5FF]/30">
      <div className="flex h-full">
        {/* Left Nav Strip */}
        <div className="w-20 border-r border-[#00E5FF]/10 flex flex-col items-center py-8 gap-8 bg-black/40">
           <div className="p-3 bg-[#00E5FF] rounded shadow-lg shadow-[#00E5FF]/20">
              <Plane className="text-black" />
           </div>
           <div className="flex-1 flex flex-col gap-6">
              <NavButton 
                icon={<Globe size={20} />} 
                active={activeTab === 'cities'} 
                onClick={() => setActiveTab('cities')}
              />
              <NavButton 
                icon={<Rocket size={20} />} 
                active={activeTab === 'aircraft'} 
                onClick={() => setActiveTab('aircraft')}
              />
              <NavButton 
                icon={<Trophy size={20} />} 
                active={activeTab === 'missions'} 
                onClick={() => setActiveTab('missions')}
              />
              <NavButton 
                icon={<DollarSign size={20} />} 
                active={activeTab === 'store'} 
                onClick={() => setActiveTab('store')}
              />
              <NavButton icon={<Users size={20} />} />
              <NavButton icon={<Settings size={20} />} />
           </div>
           <div className="text-[10px] font-mono rotate-180 writing-mode-vertical opacity-20 py-4 tracking-widest">
              SIM_PRO_X_v1.0
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
           {/* Top Header */}
            <header className="h-20 border-b border-[#00E5FF]/10 flex items-center justify-between px-12 bg-black/20 backdrop-blur-sm">
               <div className="flex flex-col">
                  <h1 className="text-lg font-bold tracking-widest uppercase italic text-[#00E5FF]">SkyHigh Command</h1>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase">Ops Center // Growth Phase 2</p>
               </div>
               
               {/* User Progression Metrics */}
               <div className="flex items-center gap-10">
                  <HeaderMetric label="Level" value={userMetrics.level} />
                  <HeaderMetric label="Experience" value={`${userMetrics.xp} XP`} />
                  <HeaderMetric label="Credits" value={`${userMetrics.credits.toLocaleString()} CR`} />
               </div>

               <div className="flex items-center gap-6">
                  {activeMissionId && (
                    <div className="px-4 py-1.5 border border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#00E5FF] text-[10px] font-bold uppercase tracking-widest">
                       Active: {MISSIONS.find(m => m.id === activeMissionId)?.title}
                    </div>
                  )}
                  <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
               </div>
            </header>

            {/* Content Grid */}
            <main className="flex-1 overflow-y-auto grid grid-cols-12 gap-8 p-12">
               {activeTab === 'store' && (
                  <div className="col-span-12 flex flex-col gap-8">
                     <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white underline decoration-[#00E5FF]/20">Pro Marketplace</h2>
                        <p className="text-[#00E5FF] text-xs font-mono tracking-widest uppercase">Optimize retention via premium assets</p>
                     </div>

                     <div className="grid grid-cols-3 gap-6">
                        <StoreCard 
                          title="Premium Fuel" 
                          desc="Unlimited flight range for 24h. No re-fueling required." 
                          price="4,500 CR" 
                          icon={<Zap className="text-yellow-400" />}
                        />
                        <StoreCard 
                          title="XP Booster" 
                          desc="Double XP gain for missions." 
                          price="2,000 CR" 
                          icon={<TrendingUp className="text-[#00E5FF]" />}
                        />
                        <StoreCard 
                          title="Elite Skin" 
                          desc="Exclusive 24k gold skin for aircraft." 
                          price="15,000 CR" 
                          icon={<DollarSign className="text-amber-500" />}
                        />
                     </div>
                  </div>
               )}

               {activeTab === 'cities' && (
                  <div className="col-span-8 flex flex-col gap-6">
                     <div className="flex items-baseline justify-between">
                        <h2 className="text-2xl font-light tracking-widest uppercase">Select Target City</h2>
                        <span className="text-[10px] opacity-40 uppercase tracking-widest">{CITIES.length} Sectors Scanned</span>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        {CITIES.map((city) => (
                           <button
                              key={city.name}
                              onClick={() => setCity(city)}
                              className={`group relative h-40 rounded bg-[#0F172A]/40 border transition-all duration-300 ${
                                 selectedCity?.name === city.name ? 'border-[#00E5FF] ring-1 ring-[#00E5FF]/20' : 'border-white/5 hover:border-[#00E5FF]/40'
                              }`}
                           >
                              <img 
                                src={`https://picsum.photos/seed/${city.name}/600/400`} 
                                className="absolute inset-0 w-full h-full object-cover grayscale opacity-20 group-hover:opacity-40 transition-all duration-500" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute bottom-6 left-6 text-left">
                                 <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[#00E5FF] text-[10px] font-mono uppercase tracking-widest">{city.lat.toFixed(2)}N {city.lng.toFixed(2)}W</span>
                                 </div>
                                 <h3 className="text-xl font-bold tracking-widest uppercase">{city.name}</h3>
                              </div>
                              {selectedCity?.name === city.name && (
                                 <motion.div 
                                    layoutId="selector" 
                                    className="absolute top-4 right-4 w-6 h-6 bg-[#00E5FF] rounded-sm flex items-center justify-center shadow-lg shadow-[#00E5FF]/40"
                                 >
                                    <Play size={12} className="text-black fill-current ml-0.5" />
                                 </motion.div>
                              )}
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'aircraft' && (
                  <div className="col-span-8 flex flex-col gap-6">
                     <div className="flex items-baseline justify-between">
                        <h2 className="text-2xl font-light tracking-widest uppercase">Select Aircraft</h2>
                        <span className="text-[10px] opacity-40 uppercase tracking-widest">{AIRCRAFT_MODELS.length} Vessels in Hangar</span>
                     </div>
                     
                     <div className="grid grid-cols-1 gap-4">
                        {AIRCRAFT_MODELS.map((aircraft) => (
                           <button
                              key={aircraft.id}
                              onClick={() => setAircraft(aircraft.id)}
                              className={`group relative p-8 rounded bg-[#0F172A]/40 border transition-all duration-300 text-left flex items-center gap-8 ${
                                 selectedAircraftId === aircraft.id ? 'border-[#00E5FF] ring-1 ring-[#00E5FF]/20' : 'border-white/5 hover:border-[#00E5FF]/40'
                              }`}
                           >
                              <div className="w-32 h-20 bg-black/40 rounded flex items-center justify-center border border-white/5 group-hover:border-[#00E5FF]/40 overflow-hidden">
                                 <Rocket size={24} className={selectedAircraftId === aircraft.id ? 'text-[#00E5FF]' : 'opacity-20'} />
                              </div>
                              <div className="flex-1">
                                 <h3 className="text-xl font-bold tracking-widest uppercase mb-1">{aircraft.name}</h3>
                                 <p className="text-[11px] opacity-60 mb-4">{aircraft.description}</p>
                                 <div className="flex gap-4">
                                    <AircraftStat label="SPE" value={aircraft.stats.speed} />
                                    <AircraftStat label="AGI" value={aircraft.stats.agility} />
                                    <AircraftStat label="FUE" value={aircraft.stats.fuel} />
                                 </div>
                              </div>
                              <div className="text-[#00E5FF]">
                                 {selectedAircraftId === aircraft.id ? <Check size={20} /> : <div className="w-5 h-5 border border-white/10 rounded-full" />}
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'missions' && (
                  <div className="col-span-8 flex flex-col gap-6">
                     <div className="flex items-baseline justify-between">
                        <h2 className="text-2xl font-light tracking-widest uppercase">Mission Board</h2>
                        <span className="text-[10px] opacity-40 uppercase tracking-widest">{MISSIONS.length} Ops Available</span>
                     </div>
                     
                     <div className="flex flex-col gap-4">
                        {MISSIONS.map((mission) => (
                           <button
                              key={mission.id}
                              onClick={() => {
                                 startMission(mission.id);
                                 if (!selectedCity) setCity(CITIES[0]); // Default city if none selected
                                 setActiveTab('cities'); // Redirect to city to pick destination or start
                              }}
                              className={`group relative p-6 rounded bg-[#0F172A]/40 border transition-all duration-300 flex items-center gap-6 ${
                                 activeMissionId === mission.id ? 'border-[#00E5FF] ring-1 ring-[#00E5FF]/20' : 'border-white/5 hover:border-[#00E5FF]/40'
                              }`}
                           >
                              <div className="w-12 h-12 rounded bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF]">
                                 {mission.type === 'LANDING' && <Plane size={24} />}
                                 {mission.type === 'CARGO' && <Package size={24} />}
                                 {mission.type === 'RESCUE' && <LifeBuoy size={24} />}
                              </div>
                              <div className="flex-1 text-left">
                                 <h3 className="text-lg font-bold tracking-widest uppercase mb-1">{mission.title}</h3>
                                 <p className="text-[11px] opacity-60 line-clamp-1">{mission.description}</p>
                              </div>
                              <div className="text-right">
                                 <div className="text-[10px] text-[#00E5FF] font-mono mb-1">REWARD: {mission.reward} CR</div>
                                 <div className="text-[9px] opacity-40">LIMIT: {mission.timeLimit}s</div>
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               {/* Right Column - Stats & Action */}
               <div className="col-span-4 flex flex-col gap-6">
                  <div className="glass-panel p-8 shadow-2xl">
                     <h3 className="text-[10px] uppercase tracking-widest opacity-40 mb-6 font-mono text-[#64748B]">Pre-Flight Telemetry</h3>
                     
                     <div className="space-y-6">
                        <StatusRow label="Vessel" value={AIRCRAFT_MODELS.find(a => a.id === selectedAircraftId)?.name || "Unknown"} />
                        <StatusRow label="Mode" value={activeMissionId ? "Mission Protocol" : "Free Flight"} />
                        <StatusRow label="Physics" value="Aero Balancing" />
                        <StatusRow label="Region" value={selectedCity?.name || "Unselected"} />
                     </div>

                     <div className="mt-12">
                        <button
                           disabled={!selectedCity && !activeMissionId}
                           onClick={() => setPlaying(true)}
                           className="w-full py-5 bg-[#00E5FF] hover:bg-[#00E5FF]/80 disabled:bg-white/5 disabled:text-white/20 text-black font-black text-sm tracking-[0.3em] uppercase transition-all rounded shadow-[0_0_20px_rgba(0,229,255,0.2)] flex items-center justify-center gap-4 group"
                        >
                           Engage Simulation
                           <Play size={16} className="fill-current group-hover:translate-x-1 transition-transform" />
                        </button>
                     </div>
                  </div>

                  <div className="flex-1 glass-panel p-6 font-mono text-[10px] flex flex-col gap-4">
                     <div className="flex items-center gap-2 opacity-40">
                        <Navigation size={12} />
                        <span>CONSOLE_LOG</span>
                     </div>
                     <div className="space-y-1 opacity-60 text-[#64748B]">
                        <p>{"> "} INIT_MAP_ENGINE... [OK]</p>
                        <p>{"> "} SYNC_MULTI_LAYER... [OK]</p>
                        <p className="text-[#00E5FF] animate-pulse">{"> "} READY_FOR_FLIGHT_EXECUTION</p>
                     </div>
                  </div>
               </div>
            </main>
         </div>
      </div>
    </div>
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

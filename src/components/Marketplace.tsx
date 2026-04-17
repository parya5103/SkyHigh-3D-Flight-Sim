import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Zap, Fuel, CreditCard } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function Marketplace({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const credits = useGameStore((state) => state.userMetrics.credits);
  const purchaseFuel = useGameStore((state) => state.purchaseFuel);
  const purchaseSkin = useGameStore((state) => state.purchaseSkin);
  const ownedSkins = useGameStore((state) => state.userMetrics.ownedSkins);

  const skins = [
    { id: 'premium_stealth', name: 'Midnight Stealth', price: 2500, preview: 'https://picsum.photos/seed/stealth/400/200' },
    { id: 'premium_chrome', name: 'Chrome Horizon', price: 5000, preview: 'https://picsum.photos/seed/chrome/400/200' },
    { id: 'premium_royal', name: 'Royal Gold', price: 10000, preview: 'https://picsum.photos/seed/gold/400/200' },
  ];

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60"
    >
      <div className="bg-[#0A0C10] border border-white/10 w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-bottom border-white/10 flex justify-between items-center bg-black/40">
           <div className="flex items-center gap-3">
              <ShoppingCart className="text-[#00E5FF]" />
              <h2 className="text-xl font-black tracking-widest uppercase italic text-white">Logistics & Marketplace</h2>
           </div>
           <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded flex items-center gap-2">
                 <Zap size={14} className="text-[#00E5FF]" />
                 <span className="text-sm font-mono font-bold text-white text-emerald-400">{credits.toLocaleString()} CR</span>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest">Close [Esc]</button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Section: Fuel */}
           <div className="bg-white/5 p-6 border border-white/5">
              <div className="flex items-center gap-2 mb-6">
                 <Fuel className="text-orange-500" />
                 <h3 className="text-sm font-bold tracking-[0.2em] text-white/60 uppercase">Fuel Depot</h3>
              </div>
              <div className="space-y-4">
                 <MarketItem 
                    title="10% AV-GAS REFILL" 
                    price={50} 
                    onAction={() => purchaseFuel(10)} 
                    icon={<Zap size={16} />} 
                 />
                 <MarketItem 
                    title="50% BATT-CELL RECHARGE" 
                    price={200} 
                    onAction={() => purchaseFuel(50)} 
                    icon={<Zap size={16} />} 
                 />
                 <MarketItem 
                    title="100% MAXIMUM TANK" 
                    price={350} 
                    onAction={() => purchaseFuel(100)} 
                    icon={<Zap size={16} />} 
                 />
              </div>
              <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/20 text-[10px] text-orange-200 uppercase font-mono leading-relaxed">
                 NOTICE: Flying solo across continents requires strategic fueling. Ensure your reserves are topped before mission engagement.
              </div>
              
              <div className="mt-8">
                 <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={14} className="text-[#00E5FF]" />
                    <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Account Billing</h3>
                 </div>
                 <button 
                    onClick={() => useGameStore.getState().updateUserMetrics({ credits: credits + 5000 })}
                    className="w-full py-4 bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-bold text-[10px] tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all uppercase"
                 >
                    Fund Account (Stripe Simulation)
                 </button>
              </div>
           </div>

           {/* Section: Premium Skins */}
           <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                 <CreditCard className="text-purple-500" />
                 <h3 className="text-sm font-bold tracking-[0.2em] text-white/60 uppercase">Premium Hangar</h3>
              </div>
              {skins.map(skin => (
                <div key={skin.id} className="group relative bg-white/5 border border-white/5 overflow-hidden transition-all hover:border-[#00E5FF]/40">
                   <img src={skin.preview} alt={skin.name} className="w-full h-32 object-cover opacity-60 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                   <div className="p-4 flex justify-between items-center">
                      <div>
                         <div className="text-[10px] text-white/40 font-mono tracking-widest uppercase mb-1">AIRCRAFT_WRAP</div>
                         <div className="text-sm font-bold text-white uppercase">{skin.name}</div>
                      </div>
                      <button 
                         onClick={() => purchaseSkin(skin.id, skin.price)}
                         disabled={ownedSkins.includes(skin.id)}
                         className={`px-4 py-2 border font-black text-[10px] tracking-widest uppercase ${ownedSkins.includes(skin.id) ? 'border-emerald-500/40 text-emerald-500 cursor-default' : 'border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black transition-all'}`}
                      >
                         {ownedSkins.includes(skin.id) ? 'OWNED' : `${skin.price} CR`}
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function MarketItem({ title, price, onAction, icon }: { title: string; price: number; onAction: () => void; icon: React.ReactNode }) {
   return (
      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
         <div className="flex items-center gap-4">
            <div className="text-white/40 group-hover:text-[#00E5FF] transition-colors">{icon}</div>
            <span className="text-[10px] font-bold text-white tracking-widest">{title}</span>
         </div>
         <button 
            onClick={onAction}
            className="text-[10px] font-mono font-black text-emerald-400 border-b border-emerald-400/20 hover:border-emerald-400 transition-all"
         >
            {price} Credits
         </button>
      </div>
   );
}

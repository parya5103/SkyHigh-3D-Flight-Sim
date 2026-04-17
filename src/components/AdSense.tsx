import React from 'react';

export function AdSense({ type = 'sidebar' }: { type?: 'sidebar' | 'banner' }) {
  // Static placeholder for simulation environment
  const isSidebar = type === 'sidebar';
  
  return (
    <div 
      className={`bg-[#05070A] border border-white/5 flex flex-col items-center justify-center p-4 overflow-hidden relative group transition-all ${
        isSidebar ? 'w-full aspect-[4/5]' : 'w-full h-24 my-4'
      }`}
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/20 group-hover:border-[#00E5FF]/40 transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-white/20 group-hover:border-[#00E5FF]/40 transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-white/20 group-hover:border-[#00E5FF]/40 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/20 group-hover:border-[#00E5FF]/40 transition-colors" />

      <div className="text-[8px] font-mono text-white/20 absolute top-2 right-2 tracking-widest uppercase">SPONSORED_FEED</div>
      
      <div className="flex flex-col items-center gap-3">
         <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
            <div className="w-4 h-4 bg-[#00E5FF]/20 rounded-sm animate-pulse" />
         </div>
         <div className="text-center">
            <div className="text-[10px] font-black tracking-[0.2em] text-white/60 uppercase mb-1">Upgrade To Pro</div>
            <p className="text-[8px] text-white/30 font-mono leading-tight max-w-[120px] mx-auto">REMOVE SPONSORSHIP AND UNLOCK GLOBAL PHOTOGRAMMETRY</p>
         </div>
      </div>
      
      {/* Subtle scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
    </div>
  );
}

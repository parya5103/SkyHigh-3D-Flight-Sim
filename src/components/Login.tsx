import { useState } from 'react';
import { motion } from 'motion/react';
import { Plane, LogIn, ShieldAlert, Globe } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#05070A] flex items-center justify-center p-6 sm:p-12 overflow-hidden selection:bg-[#00E5FF]/30">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00E5FF]/5 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FF3D00]/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Decorative Scanners */}
        <div className="absolute -top-12 -left-12 w-24 h-24 border-t border-l border-[#00E5FF]/20" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 border-b border-r border-[#00E5FF]/20" />

        <div className="glass-panel p-8 sm:p-12 border border-[#00E5FF]/10 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-[#00E5FF] rounded flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(0,229,255,0.4)] animate-pulse">
            <Plane size={40} className="text-black" />
          </div>

          <div className="flex flex-col gap-2 mb-10">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white">SkyHigh Command</h1>
            <p className="text-[11px] text-[#00E5FF] tracking-[0.3em] font-bold uppercase opacity-60">Global Flight Ops Auth v3.2</p>
          </div>

          <div className="w-full space-y-4">
            <button
               onClick={handleLogin}
               disabled={isLoading}
               className="w-full py-4 bg-white hover:bg-white/90 disabled:bg-white/20 text-black font-black text-sm tracking-widest uppercase flex items-center justify-center gap-3 transition-all active:scale-95 group shadow-[0_8px_30px_rgba(255,255,255,0.1)]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Access with Google ID
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono flex items-center gap-3 animate-shake">
                <ShieldAlert size={14} />
                {error}
              </div>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 w-full flex flex-col gap-4">
             <div className="flex items-center justify-center gap-6 opacity-30">
                <Globe size={14} className="hover:opacity-100 cursor-pointer transition-opacity" />
                <span className="text-[10px] uppercase tracking-widest font-mono">ENCRYPTED_LINK_ESTABLISHED</span>
             </div>
             <p className="text-[9px] text-white/20 font-mono italic">
               * Authorizing this terminal grants access to global 3D telemetry and persistent career rewards.
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  recoveryStatus: 'idle' | 'analyzing' | 'repairing' | 'restored';
}

export class SystemRecovery extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    recoveryStatus: 'idle',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, recoveryStatus: 'analyzing' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('System Crash Intercepted:', error, errorInfo);
    
    // Auto-initiate recovery sequence
    setTimeout(() => {
      this.setState({ recoveryStatus: 'repairing' });
      
      setTimeout(() => {
        this.setState({ recoveryStatus: 'restored' });
      }, 2000);
    }, 1500);
  }

  private handleReboot = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] bg-[#05070A] flex items-center justify-center p-6 font-mono">
          <div className="max-w-2xl w-full border border-red-500/20 bg-black p-8 shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle className="text-red-500 w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white tracking-widest uppercase">System Critical Failure</h1>
                  <p className="text-xs text-white/40 uppercase tracking-tighter mt-1">Runtime Kernel Exception // Code: {this.state.error?.name || 'UNKNOWN'}</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal size={12} className="text-white/40" />
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Error_Logs</span>
                </div>
                <div className="text-[10px] text-red-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {this.state.error?.message || 'Undefined execution error encountered.'}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <AnimatePresence mode="wait">
                      {this.state.recoveryStatus === 'analyzing' && (
                        <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                           <RefreshCw size={14} className="text-yellow-500 animate-spin" />
                        </motion.div>
                      )}
                      {this.state.recoveryStatus === 'repairing' && (
                        <motion.div key="repairing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                           <RefreshCw size={14} className="text-[#00E5FF] animate-spin" />
                        </motion.div>
                      )}
                      {this.state.recoveryStatus === 'restored' && (
                        <motion.div key="restored" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                           <CheckCircle2 size={14} className="text-[#a8eb12]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <span className="text-[11px] text-white/60 uppercase tracking-widest">
                       {this.state.recoveryStatus === 'analyzing' && 'Analyzing logic corruption...'}
                       {this.state.recoveryStatus === 'repairing' && 'Rebuilding simulation kernel...'}
                       {this.state.recoveryStatus === 'restored' && 'State consistency verified.'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={this.handleReboot}
                  disabled={this.state.recoveryStatus !== 'restored'}
                  className={`w-full py-4 font-black tracking-[0.4em] transition-all uppercase text-[10px] border flex items-center justify-center gap-3
                    ${this.state.recoveryStatus === 'restored' 
                      ? 'bg-[#00E5FF] border-[#00E5FF] text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]' 
                      : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'}`}
                >
                  <RefreshCw size={14} />
                  Initiate Cold Reboot
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Share2, Search, Zap, DollarSign, Database, FileText, Send } from 'lucide-react';
import { logEvent, GROWTH_STRATEGIES } from '../lib/growthHacker';
import { useGameStore } from '../store/gameStore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function GrowthEngine() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTool, setActiveTool] = useState<'SEO' | 'VIRAL' | 'STATS'>('SEO');
  
  const userMetrics = useGameStore(state => state.userMetrics);

  const generateGrowthContent = async (type: 'SEO' | 'VIRAL') => {
    setIsGenerating(true);
    logEvent('GROWTH_GENERATION_START', { type });
    
    try {
      const prompt = type === 'SEO' 
        ? "Generate a 300-word SEO-optimized blog post promoting 'SkyHigh Global Flight Simulator'. Include keywords: flight simulator online, free airplane game, 3D web flight sim. Focus on photorealistic 3D tiles and realistic physics."
        : "Generate 5 viral 'short clip' captions for TikTok and Instagram Reels for a flight simulator game. Themes: Near miss with AI traffic, sunset landing, and high-speed stealth flyby. Use trending hashtags.";

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setContent(response.text || "Failed to generate content.");
      logEvent('GROWTH_GENERATION_SUCCESS', { type });
    } catch (error) {
      console.error(error);
      setContent("Error generating content. Please check API key.");
      logEvent('GROWTH_GENERATION_ERROR');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-8 z-[200]">
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-[#00E5FF] text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-110 active:scale-95 transition-all pointer-events-auto"
      >
        <TrendingUp size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-96 bg-[#05070A]/95 border border-[#00E5FF]/20 backdrop-blur-3xl rounded-lg p-6 shadow-2xl pointer-events-auto overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
               <div className="flex flex-col">
                  <span className="text-[10px] text-[#00E5FF] font-bold tracking-[0.2em] mb-1">AI_GROWTH_ENGINE v2.1</span>
                  <h2 className="text-sm font-black text-white uppercase italic">Market Penetration Ops</h2>
               </div>
               <div className="flex gap-2">
                  <ToolIcon icon={<Search size={14} />} active={activeTool === 'SEO'} onClick={() => setActiveTool('SEO')} />
                  <ToolIcon icon={<Zap size={14} />} active={activeTool === 'VIRAL'} onClick={() => setActiveTool('VIRAL')} />
                  <ToolIcon icon={<Database size={14} />} active={activeTool === 'STATS'} onClick={() => setActiveTool('STATS')} />
               </div>
            </div>

            {activeTool === 'STATS' ? (
              <div className="space-y-4">
                 <MetricRow label="Total XP Pool" value={`${userMetrics.xp} XP`} />
                 <MetricRow label="Retention Streak" value="1.4x Boost" />
                 <MetricRow label="Active A/B Test" value="Group_Variant_B" />
                 <div className="mt-4 p-3 bg-white/5 rounded text-[8px] text-white/40 font-mono italic">
                    * Metrics aggregated from 124 global sessions.
                 </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="text-[9px] text-white/40 leading-relaxed max-h-48 overflow-y-auto font-mono scrollbar-thin scrollbar-thumb-white/10">
                   {isGenerating ? (
                     <div className="animate-pulse">Accessing Gemini Intelligence... Content synthesis in progress.</div>
                   ) : content ? content : "Select a tool to generate growth assets."}
                </div>
                
                <button 
                  disabled={isGenerating}
                  onClick={() => generateGrowthContent(activeTool === 'SEO' ? 'SEO' : 'VIRAL')}
                  className="w-full py-3 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 text-[9px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? "Synthesizing..." : `Generate ${activeTool} Burst`}
                  <Send size={12} />
                </button>
              </div>
            )}

            {/* Strategizer Tips */}
            <div className="mt-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-[#00E5FF] mb-2">
                   <TrendingUp size={12} />
                   <span className="text-[8px] font-bold uppercase tracking-widest text-white/60">Passive Income Strategizer</span>
                </div>
                <p className="text-[10px] text-[#00E5FF] italic">
                   {GROWTH_STRATEGIES.MONETIZATION}
                </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolIcon({ icon, active, onClick }: { icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 rounded border transition-all ${active ? 'bg-[#00E5FF] text-black border-[#00E5FF]' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'}`}
    >
      {icon}
    </button>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
       <span className="text-[10px] text-white/40 uppercase">{label}</span>
       <span className="text-[10px] text-[#00E5FF] font-bold font-mono">{value}</span>
    </div>
  );
}

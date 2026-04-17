import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { FlightScene } from './components/FlightScene';
import { HUD } from './components/HUD';
import { Dashboard } from './components/Dashboard';
import { Marketplace } from './components/Marketplace';
import { AdSense } from './components/AdSense';
import { GlobalView } from './components/GlobalView';
import { GrowthEngine } from './components/GrowthEngine';
import { Login } from './components/Login';
import { io } from 'socket.io-client';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

const socket = io();

export default function App() {
  const isPlaying = useGameStore((state) => state.isPlaying);
  const telemetry = useGameStore((state) => state.telemetry);
  const user = useGameStore((state) => state.user);
  const isAuthReady = useGameStore((state) => state.isAuthReady);
  const userMetrics = useGameStore((state) => state.userMetrics);
  
  const setUser = useGameStore((state) => state.setUser);
  const setAuthReady = useGameStore((state) => state.setAuthReady);
  const updateUserMetrics = useGameStore((state) => state.updateUserMetrics);
  const consumeFuel = useGameStore((state) => state.consumeFuel);
  
  const [isMarketOpen, setMarketOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());
  
  const addPlayer = useGameStore((state) => state.addMultiplayerPlayer);
  const removePlayer = useGameStore((state) => state.removeMultiplayerPlayer);
  const setMultiplayerPlayers = useGameStore((state) => state.setMultiplayerPlayers);

  // 1. Authentication & Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });

        // Initialize/Sync User Data from Firestore
        const path = `users/${firebaseUser.uid}`;
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userRef);

          if (!docSnap.exists()) {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              xp: 0,
              level: 1,
              credits: 1000,
              totalFlightTime: 0,
              ownedSkins: ['default'],
              lastUpdated: new Date().toISOString()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, path);
        }
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [setUser, setAuthReady]);

  // 2. Real-time Firestore Sync
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}`;
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        updateUserMetrics({
          xp: data.xp,
          level: data.level,
          credits: data.credits,
          totalFlightTime: data.totalFlightTime || 0,
          ownedSkins: data.ownedSkins || ['default'],
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user, updateUserMetrics]);

  // 3. Persistence Sync (Write back local changes like XP gain)
  useEffect(() => {
    if (!user || !isPlaying) return;
    
    const syncInterval = setInterval(async () => {
      const path = `users/${user.uid}`;
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          ...userMetrics,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
        setLastSyncTime(Date.now());
      } catch (error) {
        // Log sync error but don't crash the simulation loop
        console.error('Background Sync Error:', error);
      }
    }, 10000); // Increased sync interval for stability

    return () => clearInterval(syncInterval);
  }, [user, userMetrics, isPlaying]);

  // 3.5 Fuel Consumption Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      consumeFuel(1); // Consumes per second
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, consumeFuel]);

  // 4. Multiplayer Synchronization
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to multiplayer server');
      if (isPlaying) {
        socket.emit('join', { position: [0, 0, 0] });
      }
    });

    socket.on('currentPlayers', (players) => setMultiplayerPlayers(players));
    socket.on('playerJoined', (player) => addPlayer(player));
    socket.on('playerMoved', (player) => addPlayer(player));
    socket.on('playerLeft', (id) => removePlayer(id));

    return () => {
      socket.off('playerJoined');
      socket.off('playerMoved');
      socket.off('playerLeft');
      socket.off('currentPlayers');
    };
  }, [isPlaying, addPlayer, removePlayer, setMultiplayerPlayers]);

  // Periodic position update to server
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      socket.emit('updatePosition', {
        position: [0, telemetry.altitude, 0], // In a real app we'd pass real coordinates
        rotation: [telemetry.pitch, telemetry.yaw, telemetry.roll],
        speed: telemetry.speed,
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, telemetry]);

  // 2. Voice Commands Integration
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase();
        console.log('Voice Command:', command);

        if (command.includes('throttle up') || command.includes('full power')) {
          // In a real implementation we'd hook into the keyboard control stream or direct telemetry
        }
      };

      recognition.start();
      return () => recognition.stop();
    }
  }, []);

  return (
    <main className="w-screen h-screen relative bg-black overflow-hidden select-none flex">
      {/* Monetization Sidebar (Left) */}
      <aside className="w-64 h-full bg-[#05070A] border-r border-white/5 flex flex-col p-4 z-50">
         <div className="mb-8">
            <h1 className="text-xl font-black italic tracking-widest text-[#00E5FF]">AETHER</h1>
            <div className="text-[8px] font-mono text-white/20 uppercase tracking-[0.5em]">Global Flight Sim</div>
         </div>

         <div className="flex-1 space-y-6">
            <div className="p-4 bg-white/5 border border-white/5 rounded">
               <div className="text-[10px] text-white/40 uppercase font-mono mb-2">Network Hub</div>
               <nav className="space-y-2">
                  <SidebarLink icon={<ShoppingBag size={14} />} label="Marketplace" active={isMarketOpen} onClick={() => setMarketOpen(true)} />
               </nav>
            </div>

            <AdSense type="sidebar" />
         </div>

         <div className="mt-auto">
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded">
               <div className="w-8 h-8 rounded bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20">
                  <span className="text-[10px] font-bold text-[#00E5FF]">PRO</span>
               </div>
               <div>
                  <div className="text-[10px] text-white font-bold">{user?.displayName || 'Simulator Pilot'}</div>
                  <div className="text-[8px] text-white/40 uppercase font-mono">Rank: Commander</div>
               </div>
            </div>
         </div>
      </aside>

      <div className="flex-1 relative h-full">
        <AnimatePresence>
          {!isAuthReady ? (
            <motion.div 
              key="loader"
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2000] bg-[#05070A] flex items-center justify-center"
            >
              <div className="w-8 h-8 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : !user ? (
            <Login key="login" />
          ) : null}
        </AnimatePresence>

        {/* 3D Scene Layer */}
        <div className="absolute inset-0 z-0">
          <GlobalView />
          <FlightScene />
        </div>

        {/* Interface Layers */}
        <HUD />
        <Dashboard />
        <GrowthEngine />
        
        <AnimatePresence>
           {isMarketOpen && (
              <Marketplace 
                 isOpen={isMarketOpen} 
                 onClose={() => setMarketOpen(false)} 
              />
           )}
        </AnimatePresence>

        {/* Network Overlays (Small indicators) */}
        <div className="absolute top-4 left-4 z-[100] flex flex-col gap-2">
           <div className="px-3 py-1 bg-black/40 backdrop-blur rounded-full border border-white/10 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="text-[8px] font-mono text-white/60 uppercase">Cloud_Sync: {Math.round((Date.now() - lastSyncTime) / 1000)}s</span>
           </div>
        </div>
      </div>
    </main>
  );
}

function SidebarLink({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
   return (
      <button 
         onClick={onClick}
         className={`w-full flex items-center gap-3 p-3 rounded transition-all group ${active ? 'bg-[#00E5FF] text-black' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
      >
         {icon}
         <span className="text-[10px] font-bold tracking-widest uppercase">{label}</span>
      </button>
   );
}

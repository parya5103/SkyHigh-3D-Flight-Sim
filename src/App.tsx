import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { FlightScene } from './components/FlightScene';
import { HUD } from './components/HUD';
import { Dashboard } from './components/Dashboard';
import { GrowthEngine } from './components/GrowthEngine';
import { Login } from './components/Login';
import { io } from 'socket.io-client';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { AnimatePresence, motion } from 'motion/react';

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
        const userRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          // Initialize fresh profile
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            xp: 0,
            level: 1,
            credits: 1000,
            totalFlightTime: 0,
            lastUpdated: new Date().toISOString()
          });
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

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        updateUserMetrics({
          xp: data.xp,
          level: data.level,
          credits: data.credits,
          totalFlightTime: data.totalFlightTime || 0,
        });
      }
    });

    return () => unsubscribe();
  }, [user, updateUserMetrics]);

  // 3. Persistence Sync (Write back local changes like XP gain)
  useEffect(() => {
    if (!user || !isPlaying) return;
    
    // In a real app we might debounce this
    const syncInterval = setInterval(async () => {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...userMetrics,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    }, 5000);

    return () => clearInterval(syncInterval);
  }, [user, userMetrics, isPlaying]);

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
    <main className="w-screen h-screen relative bg-black overflow-hidden select-none">
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
        <FlightScene />
      </div>

      {/* Interface Layers */}
      <HUD />
      <Dashboard />
      <GrowthEngine />

      {/* Network Overlays (Small indicators) */}
      <div className="absolute top-4 left-4 z-[100] flex flex-col gap-2">
         {/* Could list other players here */}
      </div>

      {/* Global Overlays */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none"
          />
        )}
      </AnimatePresence>
    </main>
  );
}

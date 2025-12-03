import React, { useState, useEffect, useRef } from 'react';
import { TimerState, TreeStage, FruitReward, BreakActivity } from './types';
import TreeVisual from './components/TreeVisual';
import GardenView from './components/GardenView';
import { getFunBreakActivity, getFruitFact } from './services/geminiService';
import { Play, Pause, RefreshCw, Sprout, BookOpen, Clock } from 'lucide-react';

const FOCUS_TIME_MINUTES = 25; // Standard pomodoro
// const FOCUS_TIME_MINUTES = 0.1; // For testing

const App: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME_MINUTES * 60);
  const [timerState, setTimerState] = useState<TimerState>(TimerState.IDLE);
  const [subject, setSubject] = useState<string>("Math");
  const [rewards, setRewards] = useState<FruitReward[]>([]);
  const [showGarden, setShowGarden] = useState(false);
  const [currentBreak, setCurrentBreak] = useState<BreakActivity | null>(null);
  const [breakLoading, setBreakLoading] = useState(false);
  const [newReward, setNewReward] = useState<FruitReward | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate tree stage based on progress
  const totalTime = FOCUS_TIME_MINUTES * 60;
  const progress = 1 - timeLeft / totalTime;

  const getTreeStage = (progress: number): TreeStage => {
    if (progress < 0.1) return TreeStage.SEED;
    if (progress < 0.3) return TreeStage.SPROUT;
    if (progress < 0.6) return TreeStage.SAPLING;
    if (progress < 0.9) return TreeStage.TREE;
    if (progress < 1.0) return TreeStage.FLOWERING;
    return TreeStage.FRUITING;
  };

  const currentStage = timerState === TimerState.COMPLETED ? TreeStage.FRUITING : getTreeStage(progress);

  // Start Timer
  const startTimer = () => {
    if (timerState === TimerState.IDLE || timerState === TimerState.PAUSED) {
      setTimerState(TimerState.RUNNING);
    }
  };

  // Pause Timer
  const pauseTimer = () => {
    if (timerState === TimerState.RUNNING) {
      setTimerState(TimerState.PAUSED);
    }
  };

  // Reset Timer
  const resetTimer = () => {
    setTimerState(TimerState.IDLE);
    setTimeLeft(FOCUS_TIME_MINUTES * 60);
    setCurrentBreak(null);
    setNewReward(null);
  };

  // Timer Tick
  useEffect(() => {
    if (timerState === TimerState.RUNNING) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerState]);

  const handleComplete = async () => {
    setTimerState(TimerState.COMPLETED);
    if (timerRef.current) clearInterval(timerRef.current);

    // Generate Fruit Reward
    const fruits: FruitReward['type'][] = ['APPLE', 'ORANGE', 'LEMON', 'CHERRY', 'BLUEBERRY'];
    const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
    
    // Get fact asynchronously
    const fact = await getFruitFact(randomFruit);

    const reward: FruitReward = {
      id: Date.now().toString(),
      type: randomFruit,
      earnedAt: new Date(),
      subject,
      fact
    };

    setRewards((prev) => [...prev, reward]);
    setNewReward(reward);

    // Get Break Activity
    setBreakLoading(true);
    const activity = await getFunBreakActivity(subject);
    setCurrentBreak(activity);
    setBreakLoading(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (showGarden) {
    return <GardenView rewards={rewards} onBack={() => setShowGarden(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-sky-200 -z-10 rounded-b-[3rem] shadow-lg"></div>
      
      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2 drop-shadow-md">
          <Sprout className="w-8 h-8" /> Focus Forest
        </h1>
        <button 
          onClick={() => setShowGarden(true)}
          className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full font-semibold hover:bg-white/30 transition shadow-sm"
        >
          My Garden ({rewards.length}) 🍎
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 flex flex-col items-center space-y-8 relative z-10 border-b-8 border-slate-100">
        
        {/* Subject Selector */}
        {timerState === TimerState.IDLE && (
          <div className="w-full">
            <label className="block text-slate-500 font-bold mb-2 text-sm uppercase tracking-wider">I am studying:</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 pl-10 pr-4 font-semibold text-slate-700 focus:outline-none focus:border-green-400 transition"
              />
            </div>
          </div>
        )}

        {/* Tree Container */}
        <div className="relative w-full aspect-square bg-gradient-to-b from-blue-50 to-green-50 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 flex items-center justify-center opacity-10">
                 {/* Cloud decor could go here */}
             </div>
             <TreeVisual stage={currentStage} progress={progress} />
             
             {/* Completion Overlay */}
             {timerState === TimerState.COMPLETED && newReward && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-500">
                   <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-[80%]">
                      <div className="text-5xl mb-2 animate-bounce">
                        {newReward.type === 'APPLE' && '🍎'}
                        {newReward.type === 'ORANGE' && '🍊'}
                        {newReward.type === 'LEMON' && '🍋'}
                        {newReward.type === 'CHERRY' && '🍒'}
                        {newReward.type === 'BLUEBERRY' && '🫐'}
                      </div>
                      <h3 className="text-xl font-bold text-green-700">Fruit Collected!</h3>
                      <p className="text-slate-500 text-sm mt-1">{newReward.fact || "Great job!"}</p>
                   </div>
                </div>
             )}
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center">
          <div className="text-6xl font-black text-slate-700 tracking-tight font-mono">
            {formatTime(timeLeft)}
          </div>
          <p className="text-slate-400 font-medium mt-2">
            {timerState === TimerState.IDLE && "Ready to grow?"}
            {timerState === TimerState.RUNNING && "Focusing..."}
            {timerState === TimerState.PAUSED && "Paused"}
            {timerState === TimerState.COMPLETED && "Session Complete!"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 w-full">
           {timerState === TimerState.RUNNING ? (
             <button onClick={pauseTimer} className="flex-1 bg-amber-400 hover:bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-amber-200 transition-all active:scale-95 flex items-center justify-center gap-2">
               <Pause className="w-6 h-6" /> Pause
             </button>
           ) : (
             <button 
               onClick={startTimer} 
               disabled={timerState === TimerState.COMPLETED}
               className={`flex-1 py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 
                 ${timerState === TimerState.COMPLETED 
                   ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                   : 'bg-green-500 hover:bg-green-600 text-white shadow-green-200'}`}
             >
               <Play className="w-6 h-6" /> {timerState === TimerState.PAUSED ? "Resume" : "Start Focus"}
             </button>
           )}
           
           <button onClick={resetTimer} className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-4 rounded-2xl font-bold shadow-md transition-all active:scale-95">
             <RefreshCw className="w-6 h-6" />
           </button>
        </div>

        {/* Break Activity Section (Only if completed) */}
        {timerState === TimerState.COMPLETED && (
          <div className="w-full bg-purple-50 border-2 border-purple-100 rounded-2xl p-4 animate-in slide-in-from-bottom duration-700">
             <h3 className="text-purple-800 font-bold flex items-center gap-2 mb-2">
               <Clock className="w-4 h-4" /> Break Time Suggestion
             </h3>
             {breakLoading ? (
               <div className="flex items-center gap-2 text-purple-400">
                 <span className="animate-spin">✨</span> Thinking of a fun activity...
               </div>
             ) : currentBreak ? (
               <div>
                  <div className="flex items-start gap-3">
                    <span className="text-4xl">{currentBreak.emoji}</span>
                    <div>
                      <p className="font-bold text-slate-800">{currentBreak.title}</p>
                      <p className="text-sm text-slate-600">{currentBreak.description}</p>
                    </div>
                  </div>
               </div>
             ) : null}
          </div>
        )}

      </div>
      
      <p className="mt-8 text-sky-700/60 font-medium text-sm">
        Grow your forest, one focus session at a time.
      </p>

    </div>
  );
};

export default App;
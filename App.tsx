import React, { useState, useEffect, useRef } from 'react';
import { TimerState, TreeStage, FruitReward, BreakActivity, AppSettings, DEFAULT_SETTINGS, Task, SessionLog, TimerMode, TreeType, Quote, QUOTES } from './types';
import TreeVisual from './components/TreeVisual';
import GardenView from './components/GardenView';
import TaskManager from './components/TaskManager';
import StatsDashboard from './components/StatsDashboard';
import SettingsPanel from './components/SettingsPanel';
import { StorageService } from './services/storageService';
import { getFunBreakActivity, getFruitFact } from './services/geminiService';
import { Play, Pause, RefreshCw, Sprout, BookOpen, Home, ListTodo, BarChart2, Settings, AlertTriangle, Quote as QuoteIcon } from 'lucide-react';

// Sound Assets
const SOUNDS = {
  START: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
  COMPLETE: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3?filename=achievement-bell-600.mp3',
  BREAK_COMPLETE: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
  MUSIC: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
};

const App: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'TIMER' | 'TASKS' | 'STATS' | 'SETTINGS'>('TIMER');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  // Timer State
  const [mode, setMode] = useState<TimerMode>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusDuration * 60);
  const [timerState, setTimerState] = useState<TimerState>(TimerState.IDLE);
  
  // Session Data
  const [subject, setSubject] = useState<string>("Math");
  const [rewards, setRewards] = useState<FruitReward[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Economy & Customization
  const [seeds, setSeeds] = useState<number>(0);
  const [unlockedTrees, setUnlockedTrees] = useState<TreeType[]>(['OAK']);
  
  // Temporary State
  const [showGarden, setShowGarden] = useState(false);
  const [currentBreak, setCurrentBreak] = useState<BreakActivity | null>(null);
  const [breakLoading, setBreakLoading] = useState(false);
  const [newReward, setNewReward] = useState<FruitReward | null>(null);
  const [distractionCount, setDistractionCount] = useState(0);
  const [showDistractionWarning, setShowDistractionWarning] = useState(false);
  const [dailyQuote, setDailyQuote] = useState<Quote>(QUOTES[0]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // --- INITIALIZATION & PERSISTENCE ---

  useEffect(() => {
    // Load data
    setSettings(StorageService.getSettings());
    setRewards(StorageService.getRewards());
    setTasks(StorageService.getTasks());
    setSeeds(StorageService.getSeeds());
    setUnlockedTrees(StorageService.getUnlockedTrees());
    
    // Pick random quote
    setDailyQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    // Initialize Audio
    musicRef.current = new Audio(SOUNDS.MUSIC);
    musicRef.current.loop = true;
  }, []);

  useEffect(() => {
    StorageService.saveTasks(tasks);
  }, [tasks]);
  
  useEffect(() => {
    StorageService.saveSeeds(seeds);
  }, [seeds]);

  useEffect(() => {
    StorageService.saveUnlockedTrees(unlockedTrees);
  }, [unlockedTrees]);

  useEffect(() => {
    // Apply Theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Sync timer with settings if IDLE
    if (timerState === TimerState.IDLE) {
       updateTimeForMode(mode);
    }
    
    StorageService.saveSettings(settings);
    
    // Handle Music
    if (musicRef.current) {
        musicRef.current.volume = settings.musicVolume;
        if (settings.musicEnabled && (timerState === TimerState.RUNNING)) {
            musicRef.current.play().catch(e => console.log("Audio play failed interaction required", e));
        } else {
            musicRef.current.pause();
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, mode, timerState]);

  // Play SFX helper
  const playSound = (url: string) => {
    if (settings.soundEnabled) {
        const audio = new Audio(url);
        audio.volume = 0.5;
        audio.play().catch(e => console.log(e));
    }
  };

  // --- DISTRACTION TRACKING (SOFT LOCK) ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timerState === TimerState.RUNNING && mode === 'FOCUS') {
        setDistractionCount(prev => prev + 1);
        if (settings.hardMode) {
          setShowDistractionWarning(true);
          if (Notification.permission === 'granted') {
             new Notification("Come back!", { body: "Your tree stops growing when you leave!" });
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timerState, mode, settings.hardMode]);

  // --- TIMER LOGIC ---

  const updateTimeForMode = (m: TimerMode) => {
    if (m === 'FOCUS') setTimeLeft(settings.focusDuration * 60);
    else if (m === 'SHORT_BREAK') setTimeLeft(settings.shortBreakDuration * 60);
    else setTimeLeft(settings.longBreakDuration * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimerState(TimerState.IDLE);
    updateTimeForMode(newMode);
    setCurrentBreak(null);
    setNewReward(null);
    setDistractionCount(0);
    setShowDistractionWarning(false);
  };

  const startTimer = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setTimerState(TimerState.RUNNING);
    startTimeRef.current = new Date();
    playSound(SOUNDS.START);
  };

  const pauseTimer = () => {
      setTimerState(TimerState.PAUSED);
      playSound(SOUNDS.START); // Use generic beep for pause
  };

  const resetTimer = () => {
    setTimerState(TimerState.IDLE);
    updateTimeForMode(mode);
    setCurrentBreak(null);
    setNewReward(null);
    setDistractionCount(0);
    
    // Clear any active interval
    if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }
  };

  // Tree Logic
  const totalTime = (mode === 'FOCUS' ? settings.focusDuration : mode === 'SHORT_BREAK' ? settings.shortBreakDuration : settings.longBreakDuration) * 60;
  const progress = 1 - timeLeft / totalTime;

  const getTreeStage = (p: number): TreeStage => {
    if (mode !== 'FOCUS') return TreeStage.SAPLING; 
    if (p < 0.1) return TreeStage.SEED;
    if (p < 0.3) return TreeStage.SPROUT;
    if (p < 0.6) return TreeStage.SAPLING;
    if (p < 0.9) return TreeStage.TREE;
    if (p < 1.0) return TreeStage.FLOWERING;
    return TreeStage.FRUITING;
  };

  const currentStage = timerState === TimerState.COMPLETED ? TreeStage.FRUITING : getTreeStage(progress);

  // 1. Interval just for ticking down
  useEffect(() => {
    if (timerState === TimerState.RUNNING) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState]);

  // 2. Effect to watch for completion
  useEffect(() => {
    if (timeLeft === 0 && timerState === TimerState.RUNNING) {
        handleComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, timerState]);

  const handleComplete = async () => {
    setTimerState(TimerState.COMPLETED);
    if (timerRef.current) clearInterval(timerRef.current);

    // Save Log
    const log: SessionLog = {
      id: Date.now().toString(),
      startTime: startTimeRef.current?.toISOString() || new Date().toISOString(),
      durationMinutes: mode === 'FOCUS' ? settings.focusDuration : settings.shortBreakDuration,
      mode,
      subject,
      completed: true,
      distractions: distractionCount
    };
    StorageService.saveLog(log);

    // Notification
    if (settings.soundEnabled && Notification.permission === 'granted') {
       new Notification(mode === 'FOCUS' ? "Session Complete!" : "Break Over!", {
         body: mode === 'FOCUS' ? "Great job! Take a break." : "Ready to focus again?"
       });
    }

    if (mode === 'FOCUS') {
      playSound(SOUNDS.COMPLETE);
      
      const fruits: FruitReward['type'][] = ['APPLE', 'ORANGE', 'LEMON', 'CHERRY', 'BLUEBERRY'];
      const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
      
      const fact = await getFruitFact(randomFruit);

      const reward: FruitReward = {
        id: Date.now().toString(),
        type: randomFruit,
        earnedAt: new Date().toISOString(),
        subject,
        fact
      };

      const updatedRewards = [...rewards, reward];
      setRewards(updatedRewards);
      StorageService.saveReward(reward);
      setNewReward(reward);

      setBreakLoading(true);
      const activity = await getFunBreakActivity(subject);
      setCurrentBreak(activity);
      setBreakLoading(false);

    } else {
      playSound(SOUNDS.BREAK_COMPLETE);
      if (settings.autoStartPomodoros) {
         setTimeout(() => switchMode('FOCUS'), 2000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- ECONOMY HANDLERS ---
  const handleSellFruit = (id: string, value: number) => {
    const updatedRewards = rewards.filter(r => r.id !== id);
    setRewards(updatedRewards);
    StorageService.saveRewards(updatedRewards);
    setSeeds(prev => prev + value);
    playSound(SOUNDS.START); // Reuse beep for sale
  };

  const handleBuyTree = (tree: TreeType, cost: number) => {
    if (seeds >= cost && !unlockedTrees.includes(tree)) {
        setSeeds(prev => prev - cost);
        setUnlockedTrees([...unlockedTrees, tree]);
        setSettings({...settings, selectedTree: tree});
        playSound(SOUNDS.COMPLETE);
    }
  };

  const handleClearAllData = () => {
      StorageService.clearAllData();
      setRewards([]);
      setTasks([]);
      setSeeds(0);
      setUnlockedTrees(['OAK']);
      setSettings(DEFAULT_SETTINGS);
      // Reload page to ensure clean slate
      window.location.reload();
  };

  // --- RENDER HELPERS ---

  if (showGarden) {
    return (
        <GardenView 
            rewards={rewards} 
            seeds={seeds}
            unlockedTrees={unlockedTrees}
            selectedTree={settings.selectedTree}
            onBack={() => setShowGarden(false)} 
            onSellFruit={handleSellFruit}
            onBuyTree={handleBuyTree}
            onSelectTree={(tree) => setSettings({...settings, selectedTree: tree})}
        />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-50 dark:bg-slate-900 transition-colors duration-500 overflow-hidden relative font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-slate-200 dark:bg-slate-800 -z-10 rounded-b-[3rem] shadow-lg transition-colors duration-500"></div>
      
      {/* Distraction Overlay */}
      {showDistractionWarning && timerState === TimerState.RUNNING && (
         <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm text-center animate-bounce">
               <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
               <h3 className="text-xl font-bold dark:text-white">Stay Focused!</h3>
               <p className="text-slate-600 dark:text-slate-300 mb-4">Your tree stops growing if you leave.</p>
               <button 
                 onClick={() => setShowDistractionWarning(false)}
                 className="bg-emerald-500 text-white px-6 py-2 rounded-full font-bold"
               >
                 I'm Back
               </button>
            </div>
         </div>
      )}

      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center p-6 text-slate-700 dark:text-white z-10 transition-colors">
        <h1 className="text-xl font-bold flex items-center gap-2 drop-shadow-sm">
          <Sprout className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Focus Forest
        </h1>
        <button 
          onClick={() => setShowGarden(true)}
          className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-white/80 transition shadow-sm flex items-center gap-2 border border-slate-200 dark:border-slate-600"
        >
          My Garden ({rewards.length}) 🍎
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-md bg-white dark:bg-slate-800 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] relative z-10 flex flex-col overflow-hidden transition-colors duration-500">
        
        {/* Navigation Tabs */}
        <div className="flex justify-around p-2 border-b border-slate-100 dark:border-slate-700">
           <button onClick={() => setActiveTab('TIMER')} className={`p-3 rounded-xl transition-all ${activeTab === 'TIMER' ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-white' : 'text-slate-400'}`}>
             <Home size={24} />
           </button>
           <button onClick={() => setActiveTab('TASKS')} className={`p-3 rounded-xl transition-all ${activeTab === 'TASKS' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-400'}`}>
             <ListTodo size={24} />
           </button>
           <button onClick={() => setActiveTab('STATS')} className={`p-3 rounded-xl transition-all ${activeTab === 'STATS' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-400'}`}>
             <BarChart2 size={24} />
           </button>
           <button onClick={() => setActiveTab('SETTINGS')} className={`p-3 rounded-xl transition-all ${activeTab === 'SETTINGS' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
             <Settings size={24} />
           </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-hidden relative">
          
          {/* TIMER VIEW */}
          {activeTab === 'TIMER' && (
            <div className="h-full flex flex-col items-center animate-in fade-in duration-300">
              {/* Mode Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-4 w-full">
                {(['FOCUS', 'SHORT_BREAK', 'LONG_BREAK'] as const).map(m => (
                  <button 
                    key={m}
                    onClick={() => switchMode(m)}
                    disabled={timerState === TimerState.RUNNING}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === m ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-400'}`}
                  >
                    {m.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Subject Input */}
              {mode === 'FOCUS' && timerState === TimerState.IDLE && (
                <div className="w-full mb-2 relative">
                  <BookOpen className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-green-400 transition"
                    placeholder="Subject..."
                  />
                </div>
              )}

              {/* Tree Visual Container */}
              <div className="relative w-64 h-64 mb-4 shrink-0">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-emerald-50 dark:from-slate-700 dark:to-slate-800 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden transition-colors">
                     <TreeVisual stage={currentStage} progress={progress} type={settings.selectedTree} />
                </div>
                
                {/* Reward Overlay */}
                {timerState === TimerState.COMPLETED && newReward && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                     <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur p-4 rounded-xl shadow-xl text-center animate-in zoom-in duration-300">
                        <div className="text-4xl animate-bounce">
                          {newReward.type === 'APPLE' && '🍎'}
                          {newReward.type === 'ORANGE' && '🍊'}
                          {newReward.type === 'LEMON' && '🍋'}
                          {newReward.type === 'CHERRY' && '🍒'}
                          {newReward.type === 'BLUEBERRY' && '🫐'}
                        </div>
                        <p className="text-green-600 font-bold text-sm mt-2">Earned!</p>
                     </div>
                  </div>
                )}
              </div>

              {/* Time Display */}
              <div className="text-6xl font-black text-slate-700 dark:text-white tracking-tight font-mono mb-2">
                {formatTime(timeLeft)}
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-4 w-full mb-4">
                 {timerState === TimerState.RUNNING ? (
                   <button onClick={pauseTimer} className="flex-1 bg-amber-400 hover:bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-amber-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2">
                     <Pause className="w-6 h-6" /> Pause
                   </button>
                 ) : (
                   <button 
                     onClick={startTimer} 
                     disabled={timerState === TimerState.COMPLETED}
                     className={`flex-1 py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 
                       ${timerState === TimerState.COMPLETED 
                         ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed' 
                         : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none'}`}
                   >
                     <Play className="w-6 h-6" /> {timerState === TimerState.PAUSED ? "Resume" : "Start"}
                   </button>
                 )}
                 
                 <button onClick={resetTimer} className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 p-4 rounded-2xl font-bold shadow-md transition-all active:scale-95">
                   <RefreshCw className="w-6 h-6" />
                 </button>
              </div>

              {/* Bottom Content: Quotes OR Break Activity */}
              <div className="w-full flex-1 min-h-[100px] flex items-center justify-center">
                  {timerState === TimerState.COMPLETED && mode === 'FOCUS' ? (
                     <div className="w-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-3 animate-in slide-in-from-bottom duration-500">
                        {breakLoading ? (
                        <p className="text-center text-purple-500 text-sm animate-pulse">✨ AI is finding a fun break...</p>
                        ) : currentBreak && (
                        <div className="flex gap-3 items-center">
                            <span className="text-2xl">{currentBreak.emoji}</span>
                            <div className="text-left">
                                <p className="font-bold text-sm text-slate-800 dark:text-purple-200">{currentBreak.title}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">{currentBreak.description}</p>
                            </div>
                        </div>
                        )}
                     </div>
                  ) : (
                    <div className="w-full bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 flex gap-3">
                        <QuoteIcon className="text-amber-300 shrink-0" size={24} />
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic mb-1">"{dailyQuote.text}"</p>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">- {dailyQuote.author}</p>
                        </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* OTHER VIEWS */}
          {activeTab === 'TASKS' && <TaskManager tasks={tasks} setTasks={setTasks} />}
          {activeTab === 'STATS' && <StatsDashboard />}
          {activeTab === 'SETTINGS' && <SettingsPanel settings={settings} updateSettings={(s) => setSettings({...settings, ...s})} onClearData={handleClearAllData} />}
          
        </div>
      </div>
    </div>
  );
};

export default App;
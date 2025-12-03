import React from 'react';
import { AppSettings, BeforeInstallPromptEvent } from '../types';
import { Moon, Sun, Volume2, VolumeX, Shield, ShieldAlert, Clock, Music, AlertOctagon, Download } from 'lucide-react';

interface SettingsPanelProps {
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
  onClearData: () => void;
  installPrompt: BeforeInstallPromptEvent | null;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, updateSettings, onClearData, installPrompt }) => {
  
  const handleInstall = () => {
    if (installPrompt) {
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
        });
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto pb-20">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
          {installPrompt && (
              <button 
                onClick={handleInstall}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-md flex items-center gap-2 transition-colors"
              >
                <Download size={14} /> Install App
              </button>
          )}
       </div>

       {/* Appearance */}
       <section className="mb-6">
         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Appearance & Sound</h3>
         <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
            {/* Theme */}
            <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
               <div className="flex items-center gap-3">
                 <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                   {settings.theme === 'dark' ? <Moon size={20}/> : <Sun size={20}/>}
                 </div>
                 <span className="font-medium dark:text-slate-200">Dark Mode</span>
               </div>
               <button 
                 onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                 className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.theme === 'dark' ? 'bg-blue-500' : 'bg-slate-300'}`}
               >
                 <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${settings.theme === 'dark' ? 'translate-x-6' : ''}`} />
               </button>
            </div>
            
            {/* Sound FX */}
            <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
               <div className="flex items-center gap-3">
                 <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-lg text-pink-600 dark:text-pink-400">
                   {settings.soundEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>}
                 </div>
                 <span className="font-medium dark:text-slate-200">Sound Effects</span>
               </div>
               <button 
                 onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                 className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.soundEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
               >
                 <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${settings.soundEnabled ? 'translate-x-6' : ''}`} />
               </button>
            </div>

            {/* Background Music */}
            <div className="p-4 flex flex-col gap-3">
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                        <Music size={20}/>
                    </div>
                    <span className="font-medium dark:text-slate-200">Lo-Fi Music</span>
                 </div>
                 <button 
                    onClick={() => updateSettings({ musicEnabled: !settings.musicEnabled })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.musicEnabled ? 'bg-purple-500' : 'bg-slate-300'}`}
                 >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${settings.musicEnabled ? 'translate-x-6' : ''}`} />
                 </button>
               </div>
               {settings.musicEnabled && (
                 <div className="flex items-center gap-3 pl-11">
                    <span className="text-xs text-slate-400">Vol</span>
                    <input 
                        type="range" min="0" max="1" step="0.1"
                        value={settings.musicVolume}
                        onChange={(e) => updateSettings({ musicVolume: parseFloat(e.target.value) })}
                        className="flex-1 accent-purple-500 h-1 bg-slate-200 rounded-lg appearance-none"
                    />
                 </div>
               )}
            </div>
         </div>
       </section>

       {/* Timer Config */}
       <section className="mb-6">
         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Timer Configuration</h3>
         <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
            <div>
               <div className="flex justify-between items-center mb-2">
                   <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                     <Clock size={16} /> Focus Duration (mins)
                   </label>
                   <input 
                     type="number" min="1" max="60"
                     value={settings.focusDuration}
                     onChange={(e) => {
                         const val = Math.min(60, Math.max(1, parseInt(e.target.value) || 1));
                         updateSettings({ focusDuration: val });
                     }}
                     className="w-16 p-1 text-center border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                   />
               </div>
               <input 
                 type="range" min="1" max="60" step="1" 
                 value={settings.focusDuration}
                 onChange={(e) => updateSettings({ focusDuration: parseInt(e.target.value) })}
                 className="w-full accent-emerald-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
               />
            </div>

             <div>
               <div className="flex justify-between items-center mb-2">
                   <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                     Break Duration (mins)
                   </label>
                   <input 
                     type="number" min="1" max="30"
                     value={settings.shortBreakDuration}
                     onChange={(e) => {
                         const val = Math.min(30, Math.max(1, parseInt(e.target.value) || 1));
                         updateSettings({ shortBreakDuration: val });
                     }}
                     className="w-16 p-1 text-center border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                   />
               </div>
               <input 
                 type="range" min="1" max="30" step="1" 
                 value={settings.shortBreakDuration}
                 onChange={(e) => updateSettings({ shortBreakDuration: parseInt(e.target.value) })}
                 className="w-full accent-blue-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
               />
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
               <span className="text-sm dark:text-slate-300">Auto-start Breaks</span>
               <button 
                 onClick={() => updateSettings({ autoStartBreaks: !settings.autoStartBreaks })}
                 className={`w-10 h-5 rounded-full p-1 transition-colors ${settings.autoStartBreaks ? 'bg-emerald-500' : 'bg-slate-300'}`}
               >
                 <div className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform ${settings.autoStartBreaks ? 'translate-x-5' : ''}`} />
               </button>
            </div>
         </div>
       </section>

       {/* Hard Mode */}
       <section className="mb-6">
         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Distraction Control</h3>
         <div className={`rounded-xl p-4 border transition-colors ${settings.hardMode ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700'}`}>
            <div className="flex justify-between items-start">
               <div className="flex gap-3">
                 <div className={`p-2 rounded-lg ${settings.hardMode ? 'bg-red-200 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                   {settings.hardMode ? <ShieldAlert size={20}/> : <Shield size={20}/>}
                 </div>
                 <div>
                   <p className="font-bold dark:text-white">Hard Mode</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                     Warns you if you leave the app. Analytics will log every time you lose focus.
                   </p>
                 </div>
               </div>
               <button 
                 onClick={() => updateSettings({ hardMode: !settings.hardMode })}
                 className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.hardMode ? 'bg-red-500' : 'bg-slate-300'}`}
               >
                 <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${settings.hardMode ? 'translate-x-6' : ''}`} />
               </button>
            </div>
         </div>
       </section>

       {/* Danger Zone */}
       <section className="mb-8">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Danger Zone</h3>
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-200 dark:border-red-900/30">
                <button 
                    onClick={() => {
                        if (window.confirm("WARNING: This will delete ALL your fruits, seeds, trees, tasks, and history. This cannot be undone.")) {
                            onClearData();
                        }
                    }}
                    className="w-full py-3 bg-white dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center justify-center gap-2"
                >
                    <AlertOctagon size={18} /> Reset All Data
                </button>
            </div>
       </section>
    </div>
  );
};

export default SettingsPanel;
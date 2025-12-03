import React from 'react';
import { StorageService } from '../services/storageService';
import { BarChart3, TrendingUp, Calendar, AlertTriangle, Zap } from 'lucide-react';

const StatsDashboard: React.FC = () => {
  const stats = StorageService.getStats();
  const logs = StorageService.getLogs();

  // Simple calculation for best time of day
  const morningFocus = logs.filter(l => {
    const h = new Date(l.startTime).getHours();
    return h >= 6 && h < 12 && l.completed;
  }).length;
  const afternoonFocus = logs.filter(l => {
    const h = new Date(l.startTime).getHours();
    return h >= 12 && h < 18 && l.completed;
  }).length;
  const eveningFocus = logs.filter(l => {
    const h = new Date(l.startTime).getHours();
    return h >= 18 && l.completed;
  }).length;

  const bestTime = morningFocus > afternoonFocus && morningFocus > eveningFocus ? 'Morning' :
                   afternoonFocus > morningFocus && afternoonFocus > eveningFocus ? 'Afternoon' : 'Evening';

  // Distraction data
  const totalDistractions = logs.reduce((acc, curr) => acc + (curr.distractions || 0), 0);

  return (
    <div className="w-full h-full overflow-y-auto pr-2 pb-20">
      <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
        <BarChart3 className="text-indigo-500" /> Analytics
      </h2>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl">
          <p className="text-xs text-indigo-500 dark:text-indigo-300 font-bold uppercase">Focus Today</p>
          <p className="text-2xl font-black text-indigo-700 dark:text-indigo-200">{stats.todayFocusMinutes} <span className="text-sm font-normal">min</span></p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-2xl">
          <p className="text-xs text-emerald-500 dark:text-emerald-300 font-bold uppercase">Completion Rate</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-200">{stats.completionRate}%</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-2xl">
          <p className="text-xs text-amber-500 dark:text-amber-300 font-bold uppercase">Total Sessions</p>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-200">{stats.totalSessions}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/30 p-4 rounded-2xl">
          <p className="text-xs text-rose-500 dark:text-rose-300 font-bold uppercase">Distractions</p>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-200">{totalDistractions}</p>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-5 rounded-2xl text-white shadow-lg mb-6 relative overflow-hidden">
        <Zap className="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 rotate-12" />
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><TrendingUp size={18}/> Smart Insights</h3>
        <ul className="text-sm space-y-2 relative z-10 opacity-90">
          <li>• You are most productive in the <strong>{bestTime}</strong>.</li>
          <li>• You average <strong>{Math.round(stats.totalFocusMinutes / (stats.totalSessions || 1))} mins</strong> per session.</li>
          {stats.completionRate < 70 && <li>• Try shortening your focus sessions by 5 minutes to improve completion.</li>}
        </ul>
      </div>

      {/* Recent Activity */}
      <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2"><Calendar size={18}/> Recent History</h3>
      <div className="space-y-2">
        {logs.slice(-5).reverse().map(log => (
          <div key={log.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-sm">
            <div>
               <p className="font-semibold dark:text-slate-200">{log.subject || 'Focus Session'}</p>
               <p className="text-xs text-slate-400">{new Date(log.startTime).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
               <span className={`px-2 py-1 rounded text-xs font-bold ${log.completed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                 {log.durationMinutes}m
               </span>
               {log.distractions > 0 && (
                 <p className="text-[10px] text-red-400 mt-1 flex items-center justify-end gap-1">
                   <AlertTriangle size={8} /> {log.distractions}
                 </p>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsDashboard;
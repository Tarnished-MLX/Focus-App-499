import { AppSettings, DEFAULT_SETTINGS, FruitReward, SessionLog, Task, TreeType } from "../types";

const KEYS = {
  SETTINGS: 'focus_forest_settings',
  TASKS: 'focus_forest_tasks',
  LOGS: 'focus_forest_logs',
  REWARDS: 'focus_forest_rewards',
  SEEDS: 'focus_forest_seeds',
  UNLOCKED_TREES: 'focus_forest_unlocked_trees',
};

export const StorageService = {
  // Settings
  getSettings: (): AppSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  },
  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Tasks
  getTasks: (): Task[] => {
    const data = localStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  },
  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  // Logs (History/Analytics)
  getLogs: (): SessionLog[] => {
    const data = localStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },
  saveLog: (log: SessionLog) => {
    const logs = StorageService.getLogs();
    logs.push(log);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  },

  // Rewards (Garden)
  getRewards: (): FruitReward[] => {
    const data = localStorage.getItem(KEYS.REWARDS);
    return data ? JSON.parse(data) : [];
  },
  saveRewards: (rewards: FruitReward[]) => {
    localStorage.setItem(KEYS.REWARDS, JSON.stringify(rewards));
  },
  saveReward: (reward: FruitReward) => {
    const rewards = StorageService.getRewards();
    rewards.push(reward);
    localStorage.setItem(KEYS.REWARDS, JSON.stringify(rewards));
  },

  // Economy (Seeds & Trees)
  getSeeds: (): number => {
    const data = localStorage.getItem(KEYS.SEEDS);
    return data ? parseInt(data, 10) : 0;
  },
  saveSeeds: (amount: number) => {
    localStorage.setItem(KEYS.SEEDS, amount.toString());
  },
  
  getUnlockedTrees: (): TreeType[] => {
    const data = localStorage.getItem(KEYS.UNLOCKED_TREES);
    return data ? JSON.parse(data) : ['OAK'];
  },
  saveUnlockedTrees: (trees: TreeType[]) => {
    localStorage.setItem(KEYS.UNLOCKED_TREES, JSON.stringify(trees));
  },
  
  // Analytics Helper
  getStats: () => {
    const logs = StorageService.getLogs();
    const today = new Date().toDateString();
    
    const todaysLogs = logs.filter(l => new Date(l.startTime).toDateString() === today && l.mode === 'FOCUS' && l.completed);
    const totalFocusMinutes = logs.reduce((acc, curr) => curr.mode === 'FOCUS' && curr.completed ? acc + curr.durationMinutes : acc, 0);
    
    return {
      todayFocusMinutes: todaysLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0),
      totalSessions: logs.filter(l => l.completed && l.mode === 'FOCUS').length,
      totalFocusMinutes,
      completionRate: logs.length > 0 ? Math.round((logs.filter(l => l.completed).length / logs.length) * 100) : 0
    };
  }
};
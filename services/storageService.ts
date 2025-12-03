import { AppSettings, DEFAULT_SETTINGS, FruitReward, SessionLog, Task, TreeType } from "../types";

const KEYS = {
  SETTINGS: 'focus_forest_settings',
  TASKS: 'focus_forest_tasks',
  LOGS: 'focus_forest_logs',
  REWARDS: 'focus_forest_rewards',
  SEEDS: 'focus_forest_seeds',
  UNLOCKED_TREES: 'focus_forest_unlocked_trees',
};

const safeParse = <T>(data: string | null, fallback: T): T => {
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse data from storage", e);
    return fallback;
  }
};

export const StorageService = {
  // Settings
  getSettings: (): AppSettings => {
    return safeParse(localStorage.getItem(KEYS.SETTINGS), DEFAULT_SETTINGS);
  },
  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Tasks
  getTasks: (): Task[] => {
    return safeParse(localStorage.getItem(KEYS.TASKS), []);
  },
  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  // Logs (History/Analytics)
  getLogs: (): SessionLog[] => {
    return safeParse(localStorage.getItem(KEYS.LOGS), []);
  },
  saveLog: (log: SessionLog) => {
    const logs = StorageService.getLogs();
    logs.push(log);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  },
  clearLogs: () => {
    localStorage.removeItem(KEYS.LOGS);
  },

  // Rewards (Garden)
  getRewards: (): FruitReward[] => {
    return safeParse(localStorage.getItem(KEYS.REWARDS), []);
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
    return safeParse(localStorage.getItem(KEYS.UNLOCKED_TREES), ['OAK']);
  },
  saveUnlockedTrees: (trees: TreeType[]) => {
    localStorage.setItem(KEYS.UNLOCKED_TREES, JSON.stringify(trees));
  },

  // Management
  clearAllData: () => {
      localStorage.removeItem(KEYS.SETTINGS);
      localStorage.removeItem(KEYS.TASKS);
      localStorage.removeItem(KEYS.LOGS);
      localStorage.removeItem(KEYS.REWARDS);
      localStorage.removeItem(KEYS.SEEDS);
      localStorage.removeItem(KEYS.UNLOCKED_TREES);
  },
  
  // Analytics Helper
  getStats: () => {
    const logs = StorageService.getLogs();
    const today = new Date().toDateString();
    
    // Filter for today's completed focus sessions
    const todaysLogs = logs.filter(l => {
        try {
            return new Date(l.startTime).toDateString() === today && l.mode === 'FOCUS' && l.completed;
        } catch { return false; }
    });
    
    // Calculate total focus minutes (all time)
    const totalFocusMinutes = logs.reduce((acc, curr) => curr.mode === 'FOCUS' && curr.completed ? acc + curr.durationMinutes : acc, 0);
    
    // Count total completed sessions
    const completedSessions = logs.filter(l => l.completed && l.mode === 'FOCUS').length;

    return {
      todayFocusMinutes: todaysLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0),
      totalSessions: completedSessions,
      totalFocusMinutes,
      completionRate: logs.length > 0 ? Math.round((logs.filter(l => l.completed).length / logs.length) * 100) : 0
    };
  }
};
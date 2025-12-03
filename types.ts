export enum TimerState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  BREAK = 'BREAK'
}

export enum TreeStage {
  SEED = 'SEED',
  SPROUT = 'SPROUT',
  SAPLING = 'SAPLING',
  TREE = 'TREE',
  FLOWERING = 'FLOWERING',
  FRUITING = 'FRUITING'
}

export type TreeType = 'OAK' | 'PINE' | 'SAKURA' | 'WILLOW';

export type TimerMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

export interface FruitReward {
  id: string;
  type: 'APPLE' | 'ORANGE' | 'LEMON' | 'CHERRY' | 'BLUEBERRY';
  earnedAt: string; // ISO String for JSON serialization
  subject: string;
  fact?: string;
}

export interface BreakActivity {
  title: string;
  description: string;
  emoji: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
}

export interface SessionLog {
  id: string;
  startTime: string;
  durationMinutes: number;
  mode: TimerMode;
  subject: string;
  completed: boolean;
  distractions: number;
}

export interface AppSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number;
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  hardMode: boolean; // Distraction blocking
  selectedTree: TreeType;
}

export const DEFAULT_SETTINGS: AppSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  longBreakInterval: 4,
  theme: 'light',
  soundEnabled: true,
  musicEnabled: false,
  musicVolume: 0.5,
  hardMode: false,
  selectedTree: 'OAK',
};

export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus is the key to all thinking.", author: "Bruce Lee" },
  { text: "Small steps lead to big changes.", author: "Unknown" },
  { text: "A tree falls the way it leans. Be careful how you lean.", author: "Dr. Seuss" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Starve your distractions, feed your focus.", author: "Unknown" },
  { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
];

// PWA Install Prompt Type
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
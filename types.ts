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

export interface FruitReward {
  id: string;
  type: 'APPLE' | 'ORANGE' | 'LEMON' | 'CHERRY' | 'BLUEBERRY';
  earnedAt: Date;
  subject: string;
  fact?: string;
}

export interface BreakActivity {
  title: string;
  description: string;
  emoji: string;
}

export type MathDomain = 
  | '수와 연산' 
  | '도형' 
  | '측정' 
  | '규칙성' 
  | '자료와 가능성';

export interface SRSState {
  repetitions: number;
  interval: number;      // In days
  easeFactor: number;    // Multiplier, default 2.5
  dueDate: string;       // YYYY-MM-DD
}

export interface Flashcard {
  id: string;
  grade: number;         // 1 to 6
  semester: number;      // 1 or 2
  unit: string;          // e.g. "2. 약수와 배수"
  domain: MathDomain;
  tags: string[];
  front: {
    ko: string;
    en: string;
  };
  back: {
    ko: string;
    en: string;
  };
  review: SRSState;
}

export interface Deck {
  id: string;
  name: {
    ko: string;
    en: string;
  };
  grade?: number;
  semester?: number;
  domain?: MathDomain;
  cards: Flashcard[];
}

export interface AppData {
  version: number;
  lastModified: string;
  decks: Deck[];
}

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  path: string;
  lastKnownSha?: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'conflict';

export type Language = 'ko' | 'en';

export type Theme = 'light' | 'dark' | 'system';

export * from './sync';


export interface SongLine {
  chords?: string;
  lyric: string;
  stanzaBreak?: boolean;
}

export interface Song {
  id: string;
  categoryIndex: number;
  categoryName: string;
  numberInCategory: number;
  title: string;
  tone: string;
  rawLabel: string;
  lines: SongLine[];
}

export interface Category {
  id: string;
  order: number;
  name: string;
  songs: Song[];
}

export type SlotKey = 'entrada' | 'evangelio' | 'ofertorio' | 'comunion' | 'final';

export interface ProgramSlotSelection {
  songId: string;
  title: string;
  tone: string;
  categoryName: string;
}

export type ProgramSlots = Record<SlotKey, ProgramSlotSelection | null>;

export interface SundayProgram {
  code: string;
  sundayDate: string;
  note: string;
  slots: ProgramSlots;
  publishedAt: string;
  version: number;
}

export interface ProgramDateSummary {
  sundayDate: string;
  code: string;
  note: string;
  publishedAt: string;
}

export interface SlotDefinition {
  key: SlotKey;
  order: number;
  label: string;
  shortLabel: string;
  allowedCategoryName: string | null;
  ruleDescription: string;
}

export type AppView =
  | { type: 'home' }
  | { type: 'category'; categoryId: string }
  | { type: 'song'; songId: string; returnTo?: 'home' | 'category' | 'program-view' | 'program-edit'; categoryId?: string }
  | { type: 'program-view'; mode: 'official' | 'shared-url' | 'code' | 'date' }
  | { type: 'program-edit' }
  | { type: 'manual' };

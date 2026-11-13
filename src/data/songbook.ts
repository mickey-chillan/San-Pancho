import rawSongbook from './songbook.json';
import type { Category, ProgramSlots, SlotDefinition, SlotKey, Song } from '../types';

export const SONGBOOK_CATEGORIES: Category[] = (rawSongbook as { categories: Category[] }).categories;

export const SONG_BY_ID: Map<string, Song> = new Map();
export const CATEGORY_BY_ID: Map<string, Category> = new Map();
export const ALL_SONGS_ORDERED: Song[] = [];
export const ALL_TONES_ORDERED: string[] = [];

const seenTones = new Set<string>();

for (const cat of SONGBOOK_CATEGORIES) {
  CATEGORY_BY_ID.set(cat.id, cat);
  for (const song of cat.songs) {
    SONG_BY_ID.set(song.id, song);
    ALL_SONGS_ORDERED.push(song);
    if (song.tone && !seenTones.has(song.tone)) {
      seenTones.add(song.tone);
      ALL_TONES_ORDERED.push(song.tone);
    }
  }
}

export const SLOT_DEFINITIONS: SlotDefinition[] = [
  {
    key: 'entrada',
    order: 1,
    label: '1. Canto de Entrada',
    shortLabel: 'Entrada',
    allowedCategoryName: 'ENTRADA',
    ruleDescription: 'Solo cantos de la categoría ENTRADA',
  },
  {
    key: 'evangelio',
    order: 2,
    label: '2. Evangelio',
    shortLabel: 'Evangelio',
    allowedCategoryName: 'DESP. EVANGELIO Y HOMILÍA',
    ruleDescription: 'Solo cantos de DESP. EVANGELIO Y HOMILÍA',
  },
  {
    key: 'ofertorio',
    order: 3,
    label: '3. Ofertorio',
    shortLabel: 'Ofertorio',
    allowedCategoryName: 'OFERTORIO',
    ruleDescription: 'Solo cantos de la categoría OFERTORIO',
  },
  {
    key: 'comunion',
    order: 4,
    label: '4. Comunión',
    shortLabel: 'Comunión',
    allowedCategoryName: 'COMUNIÓN',
    ruleDescription: 'Solo cantos de la categoría COMUNIÓN',
  },
  {
    key: 'final',
    order: 5,
    label: '5. Canto Final',
    shortLabel: 'Final',
    allowedCategoryName: null,
    ruleDescription: 'Cantos de cualquier categoría',
  },
];

export function canSongFitSlot(song: Song, slotKey: SlotKey): boolean {
  const def = SLOT_DEFINITIONS.find((s) => s.key === slotKey);
  if (!def) return false;
  if (def.allowedCategoryName === null) return true;
  return song.categoryName === def.allowedCategoryName;
}

export function createEmptySlots(): ProgramSlots {
  return {
    entrada: null,
    evangelio: null,
    ofertorio: null,
    comunion: null,
    final: null,
  };
}

export function getNextSundayISO(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatSundayDateSpanish(isoDate: string): string {
  if (!isoDate) return 'Domingo por definir';
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return isoDate;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

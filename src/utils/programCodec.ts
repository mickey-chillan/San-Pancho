import LZString from 'lz-string';
import { SONG_BY_ID, SLOT_DEFINITIONS, formatSundayDateSpanish } from '../data/songbook';
import type { ProgramSlots, SlotKey, SundayProgram } from '../types';

interface CompactPayload {
  c: string;
  d: string;
  n: string;
  t: string;
  v: number;
  s: Partial<Record<SlotKey, string>>;
}

export function encodeProgramToUrlParam(program: SundayProgram): string {
  const s: Partial<Record<SlotKey, string>> = {};
  for (const def of SLOT_DEFINITIONS) {
    const sel = program.slots[def.key];
    if (sel?.songId) {
      s[def.key] = sel.songId;
    }
  }
  const payload: CompactPayload = {
    c: program.code,
    d: program.sundayDate,
    n: program.note,
    t: program.publishedAt,
    v: program.version,
    s,
  };
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeProgramFromUrlParam(encoded: string): SundayProgram | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const payload = JSON.parse(json) as CompactPayload;
    if (!payload || typeof payload !== 'object' || !payload.s) return null;

    const slots: ProgramSlots = {
      entrada: null,
      evangelio: null,
      ofertorio: null,
      comunion: null,
      final: null,
    };

    for (const def of SLOT_DEFINITIONS) {
      const songId = payload.s[def.key];
      if (!songId) continue;
      const song = SONG_BY_ID.get(songId);
      if (!song) continue;
      slots[def.key] = {
        songId: song.id,
        title: song.title,
        tone: song.tone,
        categoryName: song.categoryName,
      };
    }

    return {
      code: typeof payload.c === 'string' && payload.c ? payload.c : 'URL',
      sundayDate: typeof payload.d === 'string' ? payload.d : '',
      note: typeof payload.n === 'string' ? payload.n : '',
      publishedAt: typeof payload.t === 'string' ? payload.t : new Date().toISOString(),
      version: typeof payload.v === 'number' ? payload.v : 1,
      slots,
    };
  } catch {
    return null;
  }
}

export function buildProgramShareUrl(program: SundayProgram): string {
  const encoded = encodeProgramToUrlParam(program);
  const url = new URL(window.location.origin + window.location.pathname);
  if (program.code) {
    url.searchParams.set('c', program.code);
  }
  url.searchParams.set('p', encoded);
  return url.toString();
}

export function buildWhatsAppShareUrl(program: SundayProgram, shareUrl: string): string {
  const dateText = formatSundayDateSpanish(program.sundayDate);
  const lines: string[] = [
    '*CANCIONERO SAN FRANCISCO*',
    '*Programa Oficial del Domingo*',
    `Fecha: ${dateText}`,
  ];
  if (program.note.trim()) {
    lines.push(`Nota: ${program.note.trim()}`);
  }
  lines.push('');
  for (const def of SLOT_DEFINITIONS) {
    const sel = program.slots[def.key];
    if (sel) {
      lines.push(`${def.label}: ${sel.title} [${sel.tone}]`);
    } else {
      lines.push(`${def.label}: (Sin asignar)`);
    }
  }
  lines.push('');
  if (program.code) {
    lines.push(`Código corto: ${program.code}`);
  }
  lines.push(`Abrir programa: ${shareUrl}`);

  return `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`;
}

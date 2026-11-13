import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';

interface SongEntry {
  id: string;
  categoryName: string;
  title: string;
  tone: string;
}

interface CategoryEntry {
  id: string;
  name: string;
  songs: SongEntry[];
}

type SlotKey = 'entrada' | 'evangelio' | 'ofertorio' | 'comunion' | 'final';

interface ProgramSlotSelection {
  songId: string;
  title: string;
  tone: string;
  categoryName: string;
}

type ProgramSlots = Record<SlotKey, ProgramSlotSelection | null>;

interface SundayProgramRecord {
  code: string;
  sundayDate: string;
  note: string;
  slots: ProgramSlots;
  publishedAt: string;
  version: number;
}

interface ProgramStore {
  officialCode: string | null;
  programsByCode: Record<string, SundayProgramRecord>;
  programsByDate: Record<string, SundayProgramRecord>;
}

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const STORE_PATH = path.join(DATA_DIR, 'programs-store.json');
const SONGBOOK_PATH = path.join(ROOT_DIR, 'src/data/songbook.json');

const EDITOR_USERNAME = process.env.EDITOR_USERNAME || 'cancionero';
const EDITOR_PASSWORD = process.env.EDITOR_PASSWORD || 'jufra';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.createHash('sha256').update(`${EDITOR_USERNAME}:${EDITOR_PASSWORD}:csf`).digest('hex');

const SLOT_CATEGORY_RULES: Record<SlotKey, string | null> = {
  entrada: 'ENTRADA',
  evangelio: 'DESP. EVANGELIO Y HOMILÍA',
  ofertorio: 'OFERTORIO',
  comunion: 'COMUNIÓN',
  final: null,
};

const songbookRaw = JSON.parse(fs.readFileSync(SONGBOOK_PATH, 'utf8')) as { categories: CategoryEntry[] };
const songMap = new Map<string, SongEntry>();
for (const cat of songbookRaw.categories) {
  for (const song of cat.songs) {
    songMap.set(song.id, song);
  }
}

function getUpcomingSundayISO(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function buildSeedStore(): ProgramStore {
  const sundayDate = getUpcomingSundayISO();
  const sEntrada = songMap.get('1-6') ?? songMap.get('1-1'); // VIENEN CON ALEGRIA [DO]
  const sEvangelio = songMap.get('5-5') ?? songMap.get('5-1'); // TU PALABRA ME DA VIDA [DO]
  const sOfertorio = songMap.get('6-2') ?? songMap.get('6-1'); // SABEMOS QUE VENDRAS [DO]
  const sComunion = songMap.get('11-14') ?? songMap.get('11-1'); // PESCADOR DE HOMBRES [DO]
  const sFinal = songMap.get('12-7') ?? songMap.get('24-1'); // JUNTO A TI MARIA [RE]

  const toSel = (s: SongEntry | undefined): ProgramSlotSelection | null =>
    s ? { songId: s.id, title: s.title, tone: s.tone, categoryName: s.categoryName } : null;

  const initial: SundayProgramRecord = {
    code: 'SF1001',
    sundayDate,
    note: 'Misa Dominical · Convento San Francisco de Chillán',
    slots: {
      entrada: toSel(sEntrada),
      evangelio: toSel(sEvangelio),
      ofertorio: toSel(sOfertorio),
      comunion: toSel(sComunion),
      final: toSel(sFinal),
    },
    publishedAt: new Date().toISOString(),
    version: 1,
  };

  return {
    officialCode: initial.code,
    programsByCode: { [initial.code]: initial },
    programsByDate: { [sundayDate]: initial },
  };
}

function readStore(): ProgramStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8')) as Partial<ProgramStore>;
      const programsByCode = parsed.programsByCode ?? {};
      const programsByDate: Record<string, SundayProgramRecord> = { ...(parsed.programsByDate ?? {}) };

      // Backfill programsByDate if migrating from an older store file
      for (const rec of Object.values(programsByCode)) {
        if (rec.sundayDate && !programsByDate[rec.sundayDate]) {
          programsByDate[rec.sundayDate] = rec;
        }
      }

      if (Object.keys(programsByCode).length > 0) {
        return {
          officialCode: parsed.officialCode ?? null,
          programsByCode,
          programsByDate,
        };
      }
    }
  } catch {
    // Fall back to seed store if unreadable
  }

  const seeded = buildSeedStore();
  writeStore(seeded);
  return seeded;
}

function writeStore(store: ProgramStore): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tempPath = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(tempPath, STORE_PATH);
}

function getAllDateSummaries(store: ProgramStore) {
  return Object.values(store.programsByDate)
    .sort((a, b) => b.sundayDate.localeCompare(a.sundayDate))
    .map((p) => ({
      sundayDate: p.sundayDate,
      code: p.code,
      note: p.note,
      publishedAt: p.publishedAt,
    }));
}

function generateShortCode(existing: Record<string, SundayProgramRecord>): string {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  for (let attempt = 0; attempt < 20; attempt++) {
    let suffix = '';
    const bytes = crypto.randomBytes(4);
    for (let i = 0; i < 4; i++) {
      suffix += alphabet[bytes[i] % alphabet.length];
    }
    const candidate = `SF${suffix}`;
    if (!existing[candidate]) return candidate;
  }
  return `SF${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function createEditorToken(username: string): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const payload = Buffer.from(JSON.stringify({ u: username, exp }), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyEditorToken(token: string | undefined): { valid: boolean; username?: string } {
  if (!token) return { valid: false };
  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (!safeEqual(sig, expectedSig)) return { valid: false };
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      u?: string;
      exp?: number;
    };
    if (!parsed.u || !parsed.exp || parsed.exp < Date.now()) {
      return { valid: false };
    }
    return { valid: true, username: parsed.u };
  } catch {
    return { valid: false };
  }
}

function extractBearerToken(req: express.Request): string | undefined {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return undefined;
  return auth.slice(7).trim();
}

function sanitizeSlots(rawSlots: unknown): { ok: true; slots: ProgramSlots } | { ok: false; error: string } {
  const input = (typeof rawSlots === 'object' && rawSlots !== null ? rawSlots : {}) as Record<string, unknown>;
  const result: ProgramSlots = {
    entrada: null,
    evangelio: null,
    ofertorio: null,
    comunion: null,
    final: null,
  };

  for (const key of Object.keys(SLOT_CATEGORY_RULES) as SlotKey[]) {
    const val = input[key];
    if (!val) continue;
    if (typeof val !== 'object' || val === null || typeof (val as { songId?: unknown }).songId !== 'string') {
      return { ok: false, error: `Selección inválida en el espacio ${key}.` };
    }
    const songId = (val as { songId: string }).songId;
    const song = songMap.get(songId);
    if (!song) {
      return { ok: false, error: `El canto seleccionado (${songId}) no existe en el cancionero.` };
    }
    const requiredCat = SLOT_CATEGORY_RULES[key];
    if (requiredCat !== null && song.categoryName !== requiredCat) {
      return {
        ok: false,
        error: `El espacio "${key}" solo permite cantos de la categoría ${requiredCat}.`,
      };
    }
    result[key] = {
      songId: song.id,
      title: song.title,
      tone: song.tone,
      categoryName: song.categoryName,
    };
  }

  return { ok: true, slots: result };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '128kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/auth/login', (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';

    if (!safeEqual(username, EDITOR_USERNAME) || !safeEqual(password, EDITOR_PASSWORD)) {
      res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
      return;
    }

    const token = createEditorToken(username);
    res.json({ ok: true, token, username });
  });

  app.get('/api/auth/me', (req, res) => {
    const check = verifyEditorToken(extractBearerToken(req));
    res.json({
      authenticated: check.valid,
      username: check.username ?? null,
    });
  });

  app.get('/api/program/official', (_req, res) => {
    const store = readStore();
    const program = store.officialCode ? store.programsByCode[store.officialCode] ?? null : null;
    res.json({
      program,
      allDates: getAllDateSummaries(store),
    });
  });

  app.get('/api/program/by-date/:date', (req, res) => {
    const dateStr = String(req.params.date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      res.status(400).json({ error: 'Formato de fecha inválido (use AAAA-MM-DD).' });
      return;
    }
    const store = readStore();
    const program = store.programsByDate[dateStr] ?? null;
    res.json({ program });
  });

  app.get('/api/program/by-code/:code', (req, res) => {
    const code = String(req.params.code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!code) {
      res.status(400).json({ error: 'Ingresa un código de programa válido.' });
      return;
    }
    const store = readStore();
    const program = store.programsByCode[code] ?? null;
    if (!program) {
      res.status(404).json({ error: `No se encontró ningún programa con el código ${code}.` });
      return;
    }
    res.json({ program });
  });

  app.post('/api/program/save', (req, res) => {
    const auth = verifyEditorToken(extractBearerToken(req));
    if (!auth.valid) {
      res.status(401).json({
        error: 'Debes iniciar sesión como editor para guardar o modificar programas.',
      });
      return;
    }

    const sundayDate = typeof req.body?.sundayDate === 'string' ? req.body.sundayDate.trim().slice(0, 10) : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sundayDate)) {
      res.status(400).json({ error: 'Selecciona una fecha válida del calendario.' });
      return;
    }

    const note = typeof req.body?.note === 'string' ? req.body.note.trim().slice(0, 240) : '';
    const slotsCheck = sanitizeSlots(req.body?.slots);
    if (!slotsCheck.ok) {
      res.status(400).json({ error: slotsCheck.error });
      return;
    }

    const hasAnySong = Object.values(slotsCheck.slots).some(Boolean);
    if (!hasAnySong) {
      res.status(400).json({ error: 'Selecciona al menos un canto antes de guardar.' });
      return;
    }

    const store = readStore();
    const existingForDate = store.programsByDate[sundayDate] ?? null;
    const version = (existingForDate?.version ?? 0) + 1;
    const code = generateShortCode(store.programsByCode);

    const record: SundayProgramRecord = {
      code,
      sundayDate,
      note,
      slots: slotsCheck.slots,
      publishedAt: new Date().toISOString(),
      version,
    };

    store.programsByCode[code] = record;
    store.programsByDate[sundayDate] = record;
    store.officialCode = code;
    writeStore(store);

    res.json({
      program: record,
      allDates: getAllDateSummaries(store),
    });
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cancionero San Francisco running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

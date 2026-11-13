import type { Song } from '../types';

interface SongLyricsBlockProps {
  song: Song | undefined;
  showChords: boolean;
  fontSize?: number;
  compact?: boolean;
}

export function SongLyricsBlock({
  song,
  showChords,
  fontSize = 16,
  compact = false,
}: SongLyricsBlockProps) {
  if (!song || song.lines.length === 0) {
    return (
      <p className="text-sm italic text-[#7B8494] dark:text-[#9BA7B8]">
        Letra no disponible en el catálogo.
      </p>
    );
  }

  const chordFontSize = Math.max(12, fontSize - 3);

  return (
    <div className={compact ? 'space-y-0.5' : 'space-y-1'}>
      {song.lines.map((line, idx) => {
        const isBlank = !line.lyric && !line.chords;
        if (isBlank) {
          return <div key={idx} className={compact ? 'h-2.5' : 'h-4'} />;
        }

        const isRefrainLabel = /^(coro|estribillo)\s*[:.]?/i.test(line.lyric.trim());

        return (
          <div
            key={idx}
            className={`${
              line.stanzaBreak && idx > 0
                ? compact
                  ? 'pt-2.5'
                  : 'pt-4'
                : 'pt-0.5'
            } ${
              isRefrainLabel
                ? 'border-l-2 border-[#B4691E] pl-3 dark:border-[#F2B463]'
                : ''
            }`}
          >
            {showChords && line.chords ? (
              <pre
                style={{ fontSize: `${chordFontSize}px`, lineHeight: 1.25 }}
                className="font-mono-chord m-0 overflow-x-auto whitespace-pre font-bold text-[#B4691E] dark:text-[#F2B463]"
              >
                {line.chords}
              </pre>
            ) : null}
            {line.lyric ? (
              <p
                style={{ fontSize: `${fontSize}px`, lineHeight: compact ? 1.4 : 1.45 }}
                className={`m-0 whitespace-pre-wrap ${
                  isRefrainLabel
                    ? 'font-bold text-[#1E3A5F] dark:text-[#8AB4E8]'
                    : 'font-medium text-[#181D27] dark:text-[#F3F5F8]'
                }`}
              >
                {line.lyric}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

import { jsPDF } from 'jspdf';
import { SLOT_DEFINITIONS, SONG_BY_ID, formatSundayDateSpanish } from '../data/songbook';
import type { SundayProgram } from '../types';

export interface PdfExportOptions {
  includeChords?: boolean;
}

function pdfSafeText(input: string): string {
  return input
    .replace(/→/g, '->')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[^\x20-\x7E\xA0-\xFF\u2013\u2014\u2018\u2019\u201C\u201D\u2026]/g, '');
}

export function exportProgramToPdf(
  program: SundayProgram,
  shareUrl: string,
  options: PdfExportOptions = {}
): void {
  const includeChords = options.includeChords ?? true;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const marginTop = 18;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginX * 2;
  const pageBottom = pageHeight - marginBottom;

  let y = marginTop;

  const ensureSpace = (neededMm: number, continuationLabel?: string): boolean => {
    if (y + neededMm <= pageBottom) return false;
    doc.addPage();
    y = marginTop;
    if (continuationLabel) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(123, 132, 148);
      doc.text(pdfSafeText(continuationLabel), marginX, y);
      y += 5.5;
    }
    return true;
  };

  // Encabezado institucional
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(180, 105, 30);
  doc.text('CONVENTO SAN FRANCISCO DE CHILLÁN', marginX, y);
  y += 7;

  doc.setFont('times', 'bold');
  doc.setFontSize(21);
  doc.setTextColor(30, 58, 95);
  doc.text('Programa Oficial del Domingo', marginX, y);
  y += 6.5;

  doc.setDrawColor(229, 224, 216);
  doc.setLineWidth(0.5);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 7;

  // Metadatos del programa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(24, 29, 39);
  const formattedDate = formatSundayDateSpanish(program.sundayDate);
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  doc.text(pdfSafeText(`Fecha: ${capitalizedDate}`), marginX, y);

  if (program.code) {
    doc.setFont('courier', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 58, 95);
    doc.text(pdfSafeText(`Código: ${program.code}`), pageWidth - marginX, y, { align: 'right' });
  }
  y += 6;

  if (program.note.trim()) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(82, 93, 112);
    const noteLines = doc.splitTextToSize(
      pdfSafeText(`Nota: ${program.note.trim()}`),
      contentWidth
    ) as string[];
    doc.text(noteLines, marginX, y);
    y += noteLines.length * 4.8 + 2.5;
  } else {
    y += 1.5;
  }

  // Resumen compacto de los 5 momentos de la Misa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 105, 30);
  doc.text('RESUMEN DE CANTOS', marginX, y);
  y += 3.5;

  for (const def of SLOT_DEFINITIONS) {
    const sel = program.slots[def.key];

    doc.setFillColor(250, 248, 245);
    doc.setDrawColor(229, 224, 216);
    doc.roundedRect(marginX, y, contentWidth, 11.5, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 105, 30);
    doc.text(pdfSafeText(def.label.toUpperCase()), marginX + 3.5, y + 4.6);

    if (sel) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(24, 29, 39);
      const titleLines = doc.splitTextToSize(pdfSafeText(sel.title), contentWidth - 42) as string[];
      doc.text(titleLines[0] || '', marginX + 3.5, y + 9.4);

      doc.setFont('courier', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 58, 95);
      doc.text(pdfSafeText(`[${sel.tone}]`), pageWidth - marginX - 3.5, y + 9.4, { align: 'right' });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(130, 138, 150);
      doc.text('Sin canto asignado', marginX + 3.5, y + 9.4);
    }

    y += 13;
  }

  if (shareUrl) {
    y += 1;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 110, 125);
    const urlText = pdfSafeText(`Enlace móvil: ${shareUrl}`);
    const urlLines = doc.splitTextToSize(urlText, contentWidth) as string[];
    doc.text(urlLines.slice(0, 2), marginX, y);
    y += Math.min(urlLines.length, 2) * 3.5 + 3;
  }

  // Sección de letras desplegadas de todas las canciones asignadas
  const assignedSlots = SLOT_DEFINITIONS.filter((def) => Boolean(program.slots[def.key]));

  if (assignedSlots.length > 0) {
    ensureSpace(36);
    y += 2;
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(0.6);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 6.5;

    doc.setFont('times', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(30, 58, 95);
    doc.text(
      includeChords ? 'Letras y Acordes Desplegados' : 'Letras Desplegadas de los Cantos',
      marginX,
      y
    );
    y += 8;

    for (let sIdx = 0; sIdx < assignedSlots.length; sIdx++) {
      const def = assignedSlots[sIdx];
      const sel = program.slots[def.key];
      if (!sel) continue;

      const song = SONG_BY_ID.get(sel.songId);
      const contHeader = `${def.label.toUpperCase()} · ${sel.title} [${sel.tone}] (cont.)`;

      // Garantizar espacio para la cabecera del canto y al menos las primeras líneas
      ensureSpace(32);

      // Cabecera visual del canto
      doc.setFillColor(238, 243, 248);
      doc.setDrawColor(210, 222, 236);
      doc.roundedRect(marginX, y, contentWidth, 14.5, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 105, 30);
      doc.text(
        pdfSafeText(`${def.label.toUpperCase()} · ${sel.categoryName}`),
        marginX + 4,
        y + 5.2
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12.5);
      doc.setTextColor(24, 29, 39);
      const songTitleLines = doc.splitTextToSize(pdfSafeText(sel.title), contentWidth - 36) as string[];
      doc.text(songTitleLines[0] || '', marginX + 4, y + 11.4);

      doc.setFont('courier', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 58, 95);
      doc.text(pdfSafeText(`[${sel.tone}]`), pageWidth - marginX - 4, y + 11.4, {
        align: 'right',
      });

      y += 19;

      if (!song || song.lines.length === 0) {
        ensureSpace(8, contHeader);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(123, 132, 148);
        doc.text('Letra no disponible en el catálogo.', marginX + 2, y);
        y += 8;
        continue;
      }

      for (let lIdx = 0; lIdx < song.lines.length; lIdx++) {
        const line = song.lines[lIdx];
        const rawLyric = line.lyric ?? '';
        const rawChords = line.chords ?? '';

        if (!rawLyric && !rawChords) {
          if (y > marginTop + 6) {
            y += 3.2;
          }
          continue;
        }

        if (line.stanzaBreak && lIdx > 0 && y > marginTop + 6) {
          y += 2.8;
        }

        const hasChords = includeChords && Boolean(rawChords);
        const hasLyric = Boolean(rawLyric);
        const isRefrainLabel = /^(coro|estribillo)\s*[:.]?/i.test(rawLyric.trim());

        let chordWrapped: string[] = [];
        if (hasChords) {
          doc.setFont('courier', 'bold');
          doc.setFontSize(8.5);
          chordWrapped = doc.splitTextToSize(pdfSafeText(rawChords), contentWidth - 4) as string[];
        }

        let lyricWrapped: string[] = [];
        if (hasLyric) {
          doc.setFont('helvetica', isRefrainLabel ? 'bold' : 'normal');
          doc.setFontSize(10.5);
          lyricWrapped = doc.splitTextToSize(pdfSafeText(rawLyric), contentWidth - 4) as string[];
        }

        const neededHeight =
          chordWrapped.length * 3.7 + lyricWrapped.length * 4.7 + 1.4;

        ensureSpace(neededHeight, contHeader);

        if (hasChords && chordWrapped.length > 0) {
          doc.setFont('courier', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(180, 105, 30);
          for (const cLine of chordWrapped) {
            doc.text(cLine, marginX + 2, y);
            y += 3.7;
          }
        }

        if (hasLyric && lyricWrapped.length > 0) {
          doc.setFont('helvetica', isRefrainLabel ? 'bold' : 'normal');
          doc.setFontSize(10.5);
          if (isRefrainLabel) {
            doc.setTextColor(30, 58, 95);
          } else {
            doc.setTextColor(24, 29, 39);
          }
          for (const lLine of lyricWrapped) {
            doc.text(lLine, marginX + 2, y);
            y += 4.7;
          }
        }

        y += 1.2;
      }

      if (sIdx < assignedSlots.length - 1) {
        y += 4;
        if (y + 10 <= pageBottom) {
          doc.setDrawColor(229, 224, 216);
          doc.setLineWidth(0.3);
          doc.line(marginX, y, pageWidth - marginX, y);
        }
        y += 6;
      }
    }
  }

  // Pie de página en todas las hojas
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(229, 224, 216);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 13, pageWidth - marginX, pageHeight - 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 125);
    doc.text(
      pdfSafeText(`Cancionero San Francisco · ${capitalizedDate}`),
      marginX,
      pageHeight - 8.5
    );
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - marginX, pageHeight - 8.5, {
      align: 'right',
    });
  }

  const safeDate = program.sundayDate ? program.sundayDate.replace(/[^0-9-]/g, '') : 'domingo';
  doc.save(`Programa-San-Francisco-${safeDate}.pdf`);
}

export function exportManualToPdf(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const marginTop = 18;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginX * 2;
  const pageBottom = pageHeight - marginBottom;

  let y = marginTop;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm <= pageBottom) return;
    doc.addPage();
    y = marginTop;
  };

  const addSectionTitle = (kicker: string, title: string) => {
    ensureSpace(22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 105, 30);
    doc.text(pdfSafeText(kicker.toUpperCase()), marginX, y);
    y += 5;

    doc.setFont('times', 'bold');
    doc.setFontSize(15.5);
    doc.setTextColor(30, 58, 95);
    doc.text(pdfSafeText(title), marginX, y);
    y += 3;

    doc.setDrawColor(229, 224, 216);
    doc.setLineWidth(0.4);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 6.5;
  };

  const addStep = (num: string, title: string, bullets: string[]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const titleLines = doc.splitTextToSize(pdfSafeText(`${num}. ${title}`), contentWidth) as string[];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.8);
    const wrappedBullets = bullets.map(
      (b) => doc.splitTextToSize(pdfSafeText(`- ${b}`), contentWidth - 5) as string[]
    );
    const totalBulletLines = wrappedBullets.reduce((acc, lines) => acc + lines.length, 0);
    const blockHeight = titleLines.length * 5 + totalBulletLines * 4.5 + 7;

    ensureSpace(blockHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(24, 29, 39);
    for (const tl of titleLines) {
      doc.text(tl, marginX, y);
      y += 5;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.8);
    doc.setTextColor(65, 74, 90);
    for (const bLines of wrappedBullets) {
      for (const bl of bLines) {
        doc.text(bl, marginX + 4, y);
        y += 4.5;
      }
      y += 0.8;
    }
    y += 3.5;
  };

  // Portada del manual
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(180, 105, 30);
  doc.text('CONVENTO SAN FRANCISCO DE CHILLÁN', marginX, y);
  y += 7;

  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 58, 95);
  doc.text('Manual de Uso del Cancionero', marginX, y);
  y += 6.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(82, 93, 112);
  const intro = doc.splitTextToSize(
    pdfSafeText(
      'Guía práctica paso a paso para ingresar a la plataforma, consultar los cantos de la misa y armar el repertorio musical de cualquier domingo.'
    ),
    contentWidth
  ) as string[];
  doc.text(intro, marginX, y);
  y += intro.length * 4.8 + 4;

  // Bloque 1: Usuarios finales
  addSectionTitle('Guía 1 · Asamblea y Músicos', 'Cómo ingresar y usar el cancionero (Usuarios Finales)');

  addStep('01', 'Ingreso libre sin cuentas ni contraseñas', [
    'Abre el enlace web desde tu celular o computador. No necesitas crear usuario, registrarte ni recordar claves.',
    'En la portada principal aparece de inmediato el bloque "Último Programa Publicado" con los cantos de la misa actual y todas sus letras desplegadas.',
  ]);

  addStep('02', 'Ocultar o mostrar acordes y activar Modo Noche', [
    'Toca "Ocultar Acordes" si deseas leer solo la letra limpia (ideal para la asamblea) o mantenlos visibles para guitarra.',
    'Usa el botón "Modo Noche / Modo Día" en la esquina superior derecha para adaptar el brillo en templos con poca luz.',
  ]);

  addStep('03', 'Lectura en pantalla completa y consulta de otros domingos', [
    'Pulsa "Abrir canto" en cualquier canción para agrandar o reducir el tamaño de letra con los botones "-" y "+".',
    'Usa el selector "Revisar otro domingo" o escribe un código corto (ej. SF1001) para consultar misas anteriores o futuras.',
  ]);

  addStep('04', 'Compartir y descargar el repertorio en PDF', [
    'Toca "Ver página publicada" (o la barra inferior "Ver Programa del Domingo").',
    'Desde allí puedes compartir por WhatsApp, copiar el link directo, imprimir o pulsar "Guardar PDF" para descargar un archivo con todas las letras desplegadas.',
  ]);

  addStep('05', 'Buscador general y 24 categorías oficiales', [
    'Más abajo en la portada puedes buscar cualquier canto por nombre o filtrar por tono.',
    'Las 24 categorías mantienen exactamente el orden oficial del libro (471 cantos en total).',
  ]);

  // Bloque 2: Editores
  addSectionTitle('Guía 2 · Coordinadores y Coro', 'Cómo ingresar y armar el repertorio de un domingo');

  addStep('01', 'Cómo ingresar como editor', [
    'En la portada, junto al botón "Modo Noche", pulsa "Login".',
    'Escribe el Usuario y Contraseña asignados al equipo coordinador (ambos campos ocultan los caracteres por privacidad) y presiona "Entrar como editor".',
    'Al ingresar verás el "Calendario de Editores" y en la portada aparecerán los botones "Calendario" y "Salir".',
  ]);

  addStep('02', 'Elegir el domingo en el calendario', [
    'En el Calendario de Editores, haz clic en el botón "Elegir fecha" para abrir el calendario mensual.',
    'Haz clic sobre el domingo deseado (los domingos están resaltados y las fechas que ya tienen cantos muestran un punto verde). También puedes elegir una fecha de la lista inferior para modificarla.',
    'Si lo prefieres, escribe una nota breve en "Nota para esta fecha" (ejemplo: Misa 11:00 hrs · Ensayo 10:30).',
  ]);

  addStep('03', 'Reglas para armar los 5 cantos de la misa', [
    '1. Canto de Entrada: solo permite cantos de la categoría ENTRADA.',
    '2. Evangelio: solo permite cantos de DESP. EVANGELIO Y HOMILÍA.',
    '3. Ofertorio: solo permite cantos de la categoría OFERTORIO.',
    '4. Comunión: solo permite cantos de la categoría COMUNIÓN.',
    '5. Canto Final: acepta cantos de cualquier categoría (María, Franciscanas, Animación, etc.).',
  ]);

  addStep('04', 'Cómo elegir o cambiar cada canto', [
    'En cada uno de los 5 espacios pulsa "Elegir canto" (o "Cambiar"), busca por nombre o tono y selecciona el canto.',
    'Atajo desde el cancionero: mientras navegas por cualquier categoría o lectura de canto, los editores ven el botón "Agregar al Programa" para ubicar ese canto directo en la fecha seleccionada.',
    'Debajo de cada espacio verás la letra completa desplegada para revisar antes de publicar.',
  ]);

  addStep('05', 'Guardar y publicar el repertorio del domingo', [
    'Cuando los cantos estén listos, pulsa "Guardar programación (AAAA-MM-DD)".',
    'El sistema asignará un código corto único, guardará esa fecha en el historial y la publicará como el "Último Programa Publicado" visible para toda la comunidad.',
  ]);

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(229, 224, 216);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 13, pageWidth - marginX, pageHeight - 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 125);
    doc.text('Manual de Uso · Cancionero San Francisco de Chillán', marginX, pageHeight - 8.5);
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - marginX, pageHeight - 8.5, {
      align: 'right',
    });
  }

  doc.save('Manual-Cancionero-San-Francisco.pdf');
}



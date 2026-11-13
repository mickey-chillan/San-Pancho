import fs from 'node:fs';
import path from 'node:path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const CANONICAL_CATEGORIES = [
  {
    name: 'ENTRADA',
    songs: [
      'ABRE TU JARDIN [RE]', 'YO TE ALABO [RE]', 'ACLARO [DO]', 'QUÉ BELLO ES [DO]',
      'HAZ CANTAR TU VIDA [MI]', 'VIENEN CON ALEGRIA [DO]', 'QUE ALEGRIA [MI]',
      'TRES COSAS TIENE EL AMOR [DO]', 'MENSAJERO DE LA PAZ [LAM]',
      'DEN AL SEÑOR SUS ALABANZAS [SOL]', 'VENGAN A EL [REM]', 'TANTOS HOMBRES [LA]',
      'HEY [SOL]', 'DIOS TRINO [LA]', 'SEÑOR QUIEN ENTRARA [RE]',
      'HOY LLEGAMOS A CASA [SOL]', 'HIMNO A LA ALEGRIA [LA]', 'BENDECID A DIOS [DO]',
      'PUEDO CONFIAR EN EL SEÑOR [DO]', 'JUNTOS COMO HERMANOS [DO]',
      'JOVENES, CRISTOS, JOVENES [LA]', 'SOMOS UN PUEBLO QUE CAMINA [SOL]',
      'ALEGRATE JERUSALEN [RE]', 'IGLESIA PEREGRINA [LA]', 'UN MANDAMIENTO [DO]',
      'OYE PADRE [REM]', 'BENDECIRE AL SEÑOR [DO]', 'RENDID A YAHVE [RE]',
      'VEN SEÑOR NO TARDES [RE]', 'EL SEÑOR HOY NOS REÚNE [LA]',
      'HACIA TI MORADA SANTA [LA]', 'VENGA TU REINO [LA]',
    ],
  },
  {
    name: 'PERDÓN',
    songs: [
      'TEN PIEDAD DE MÍ [LA]', 'HOY PERDONAME [DO]', 'KIRYE (MIM) [MI]',
      'SEÑOR TEN PIEDAD (REM) [RE]', 'PERDON SEÑOR (RE) [RE]',
      'SEÑOR TEN PIEDAD (SOL) [SOL]', 'TEN PIEDAD DE MÍ SEÑOR (TROTE) [SIM]',
      'OH SEÑOR TEN PIEDAD (RE-MI) [RE]', 'SEÑOR TEN PIEDAD (DO) [DO]',
      'SEÑOR TEN PIEDAD (RE) [RE]', 'OH SEÑOR (REM) [RE]',
      'SEÑOR TEN PIEDAD (REM) [RE]', 'SEÑOR TEN PIEDAD (VALS) [LA]',
      'SEÑOR TEN PIEDAD (SOL) [SOL]', 'SEÑOR TEN PIEDAD [DO]',
    ],
  },
  {
    name: 'GLORIA',
    songs: [
      'GLORIA [LA]', 'GLORIA A DIOS EN EL CIELO [RE]', 'GLORIA TRINITARIO [REM]',
      'GLORIA, ALABANZAS [SOL]', 'GLORIA A DIOS EN LAS ALTURAS [DO]',
      'GLORIA A DIOS [DO]', 'GLORIA [LA]', 'GLORIA GRANDE ES SU AMOR [REM]',
      'GLORIA GIOMBINI [DO]', '(TODOS) [LAM]',
    ],
  },
  {
    name: 'ALELUYA',
    songs: [
      'ALELUYA (DO) [DO]', 'ALELUYA TODA LA TIERRA [MIM]',
      'LA FIESTA DEL SEÑOR (MI) [MI]', 'ALELUYA VIVO ESTAS (RE) [RE]',
      'ALELUYA (MI) [MI]', 'HAY GOZO (MI) [MI]', 'ALELUYA (RE) [RE]',
      'CANTA ALELUYA AL SEÑOR [LAM]', 'EL SEÑOR RESUCITO [SEGÚN PARTITURA]',
      'ALELUYA (CORRIDO) [LA]', 'ALELUYA [RE]', 'ALEUYA GLORIA ALELUYA [DO]',
      'ALELUYA GLORIA AL SEÑOR [RE]',
    ],
  },
  {
    name: 'DESP. EVANGELIO Y HOMILÍA',
    songs: [
      'SI ALGUNO TIENE SED [MI]', 'DIOS HA HABLADO [MIM]', 'DONDE HAY AMOR [RE]',
      'HERMOSA [MI]', 'TU PALABRA ME DA VIDA [DO]', 'BENDITA [DO]',
      'AMOR, AMOR [MIM]', 'DIOS ESTA AQUI [DO]', 'ESPERO CONFIADO [MIM]',
      'CAMINARE [REM]', 'UN MANDAMIENTO NUEVO [DO]', 'ALABE TODO EL MUNDO [DO]',
      'MARAVILLOSO ES [SOL]', 'ESTOY PENSANDO EN DIOS [RE]', 'EN TI, EN TI [RE]',
      'PREPARAD [LA]', 'VEN, VEN SEÑOR [RE]', 'SI YO NO TENGO AMOR [RE]',
      'EL SEÑOR ES MI PASTOR [DO]', '33) YO LE RESUCITARE [MI]', 'LUZ DE CRISTO [RE]',
      'SIENTO TU LLAMADA [SEGÚN PARTITURA]', 'EL SEÑOR ES LA ESPERANZA [LA]',
      'EL PADRE NOS HABLA [SEGÚN PARTITURA]', 'CANTAD DANDO GRACIAS [MI]',
      'HONOR Y GLORIA [SEGÚN PARTITURA]', 'GLORIA A TI SEÑOR. [MI]',
      'OH CRISTO [SEGÚN PARTITURA]', 'ESTA AQUÍ [SI]', 'EL ME AMO [SEGÚN PARTITURA]',
      'OH SANTO DIOS [DO]', 'TU PALABRA SEÑOR ES LA [LA]', 'ACTO DE AMOR [DO]',
      'NO FIJEIS [DO]', 'INUNDA MI SER [DO]', 'COMO EL PADRE ME AMÓ [RE]',
      'VUELVAN LOS OJOS [SEGÚN PARTITURA]', 'ALLANAD [LAM]',
      'EL PEREGRINO DE EMAÚS [SOL]', 'EL TESTIGO [SOL]',
      'NO ME ELIGIERON USTEDES [REM]', 'MISERICORDIA [LAM]',
      'EN TI CONFÍA MI CORAZÓN [DO]', 'RESUCITÓ [DO]',
      'LAS MISERICORDIAS DEL SEÑOR [LAM]', 'MISERICORDIOSOS COMO EL PADRE [LAM]',
      'TEN PIEDAD SEÑOR [LAM]', 'QUE TE ALABEN LOS PUEBLOS [LA]', 'ALABARE [RE]',
      'ERES TÚ JESÚS [LAM]', 'SEÑOR ESCUCHANOS [DO]', 'LOS PASOS DE JESÚS [DO]',
      'SEÑOR DIOS NUESTRO [DO]', 'LUZ DE CRISTO [LA]', 'SIGUEME [LA]',
      'DEMOS GRACIAS [LA]', 'NADA TE TURBE [LA]', 'MARGARITAS [RE]',
      'SEÑOR A QUIEN IREMOS [DO]', 'YO CREO EN LAS PROMESAS [DO]',
      'YO SOY EL BUEN PASTOR [LA]', 'HUMILLATE [SIM]', 'GUSTAD Y VED [LAM]',
      'VIVE [DO]', 'GRACIAS POR IR A MI LADO [RE]', 'JESUS AMIGO [DO]',
      'PALABRAS DE VIDA ETERNA [SIM]', '68) EL SEÑOR ES MI LUZ [MI]',
    ],
  },
  {
    name: 'OFERTORIO',
    songs: [
      'DESPUES DE PREPARAR [RE]', 'SABEMOS QUE VENDRAS [DO]',
      'TE OFRECEMOS SEÑOR NUESTRA JUVENTUD [DO]', 'CINCO PANES [LA]',
      'PAN DE NUESTRO AMOR [LA]', 'EN TU ALTAR [DO]',
      'TOMAD SEÑOR Y RECIBID [RE]', 'NEGRA ES LA UVA [SIM]',
      'NEGRA ES LA UVA [LAM]', 'TODOS LOS PROBLEMAS [DO]', 'OFRENDA DE AMOR [LA]',
      'BENDITO SEAS [RE]', 'TE OFRECEMOS, PADRE [LA]', 'TE CONSAGRO [SOL]',
      'COME ESTE PAN [SEGÚN PARTITURA]', 'TE OFRECEMOS OH SEÑOR [DO]',
      'RECIBE, OH DIOS [DO]', 'TOMA MI OFRENDA [MI]', 'TE OFREZCO [MI]',
      'JUNTOS COMO HERMANOS [MI]', 'JUNTOS NOS ACERCAMOS [DO]', 'RECIBEME [RE]',
      'NO ME HABEIS VOSOTROS ELEGIDO [DO]', 'UNA ESPIGA [RE]',
      'EN TUS MANOS DIVINAS [SEGÚN PARTITURA]',
    ],
  },
  {
    name: 'SANTO',
    songs: [
      'SANTO DIGNO DE ALABANZA [MIM]', 'SANTO (SIM) [SI]',
      'SANTO GEN ROSSO (MIM) [MI]',
      'SANTO DIOS DEL UNIVERSO (SOL-SIM-DO-RE) [SOL]',
      'SANTO, SEÑOR DE GLORIA Y PODER [LA]', 'SANTO (BIANCHI) VALS [MI]',
      'SANTO [LA]', 'SANTO LOS ANGELES CANTAN [RE]', 'CIELO Y TIERRA (REM) [RE]',
      'SANTO TROTE [LA]', 'SANTO OH OH OH [SIM]', 'TODO TIENE TU HUELLA [LA]',
      'SANTO (SIM TROTE) [SI]', 'SANTO GRAN GOZO [RE]', 'SANTO CAMPANARIO [RE]',
    ],
  },
  {
    name: 'PADRE NUESTRO',
    songs: ['TRADICIONAL [LAM]', 'JUVENIL [SOL]', 'PADRE NUESTRO – LITURGICO [LA]'],
  },
  {
    name: 'PAZ',
    songs: [
      'PAZ [SOL]', 'DAME LA MANO [DO]', 'PAZ SEÑOR [RE]', 'PAZ EN LA TIERRA [DO]',
      'MENSAJERO DE LA PAZ [LAM]', 'LA PAZ PARA TI [SIM]', 'QUE SEA LA PAZ [DO]',
      'SU AMOR ESTÁ CORRIENDO YA [RE]', 'LA PAZ ESTE CON NOSOTROS [LAM]', 'PAZ [LA]',
    ],
  },
  {
    name: 'CORDERO',
    songs: [
      'CORDERO DE DIOS (TROTE) [RE7]', 'CORDERO (DO-MIM) [DO]',
      'CORDERO (DO-LAM-FA) [DO]', 'CORDERO (REM-LAM-SOL) POLKA [RE]',
      'CORDERO (REM) [RE]', 'CORDERO (SOL-DO RE) [SOL]', 'CORDERO DE DIOS [LA]',
      'CORDERO [LA]', 'CORDERO DE DIOS (RE) [RE]', 'DIOS DE AMOR [SOL]',
      'CORDERO MAIA [REM]',
    ],
  },
  {
    name: 'COMUNIÓN',
    songs: [
      'MILAGRO DE AMOR [SOL]', 'PAN DE VIDA [RE]', 'SOLO PARA QUE VIVAS [DO]',
      'CADA VEZ QUE TE RECIBO [MI]', 'EL SEÑOR NOS HA AMADO [RE]',
      'HACIENDOTE PAN [LAM]', 'HAMBRE DE DIOS [DO]', 'YO LE RESUCITARE [SOL]',
      'DE MI VIDA QUIERO HACER [DO]', 'QUIERO ALABARTE [DO]', 'YO SOY [LA]',
      'EUCARISTIA [LA]', 'JESUS AMIGO [SOL]', 'PESCADOR DE HOMBRES [DO]',
      'QUIERO CANTAR [DO]', 'MI IDEAL [LA]', 'ESTOY PENSANDO EN DIOS [DO]',
      'AMAR ES ENTREGARSE [RE]', 'SI YO NO TENGO AMOR [RE]',
      'CRISTO TE NECESITA [SIM]', 'SIGUEME [DO]', 'TU SIEMPRE VAS CONMIGO [SOL]',
      'YA NO TEMO [DO]', 'JESUS ESTOY AQUÍ [DO]', 'EN TI SEÑOR [RE]',
      'ORACION DE UNIDAD [RE]', 'CONSOLAD [DO]', 'VEN Y SIGUEME [SOL]',
      'ALMA MISIONERA [MI]', 'TE ALABO A TI [DO]', 'VIVE DIOS [LAM]',
      'ERES REAL [SOL]', 'MI GETSEMANI [RE]', 'HAZ QUE VEA TU ROSTRO [LAM]',
      'SAGRADO CORAZON [SOL]', 'NO SABIA [DO]', 'HE PENSADO [RE]',
      'EL ALFARERO [DO]', 'ANGELES [DO]', 'SALMO DE LA CREACION [SOL]',
      'PADRE AMERINDIO [SOL]', 'AMAME SEÑOR [LA]', 'MI PENSAMIENTO ERES TU [RE]',
      'TE ALABO EN VERDAD [RE]', 'OH GLORIFICA A DIOS [LA]',
      'TE SEGUIRE DONDE TU VAYAS [LA]', 'ME TOCASTE JESUS [SOL]',
      'ORACIÓN SIMPLE [DO]', 'AMOR TAN GRANDE [LA]', 'NADIE TE AMA COMO YO [DO]',
      'VEN AMADA MIA [LAM]', 'HOY TE QUIERO ALABAR [MI]', 'NO FIJEIS [DO]',
      'SOY UN GRANO DE ARENA [MI]', 'ALELUYA POR ESA GENTE [MI]',
      'DANOS UN CORAZON [LAM]', 'YO SOY EL CAMINO FIRME [LAM]',
      'YO TENGO UN NUEVO AMOR [MI]', 'DIME SEÑOR [DO]', 'DIA Y NOCHE [MI]',
      'TAN CERCA DE MI [LA]', '¿COMO LE CANTARE? [DO]', 'PESCADOR [LAM]',
      'YAHVE [MI]', 'EL AMOR DE CRISTO NOS REUNE [LA]', 'GRACIAS A DIOS [RE]',
      'BENDIGAMOS AL SEÑOR [LA]', 'JESUS ESTA VIVO [SOL]', 'EL PROFETA [LAM]',
      'LA ORACION [SIM]', 'TE DECLARO MI AMOR [RE]', 'DEJATE [DO]',
      'JESUS YO TE AMO [DO]', 'SEA POR SIEMPRE [SEGÚN PARTITURA]',
      'YA NO ERES PAN Y VINO [DO]', 'VIVO SOLO PARA DIOS [LA]',
      'TU QUE HABITAS [LA]', 'TU MI ALFARERO [LAM]',
      'ESTO QUE SOY ESO TE DOY [LA]', 'EL PEREGRINO DE EMAUS [LAM]',
      'TU MODO [RE]', 'ABANDONATE [MIM]', 'CANCION AL CORAZON DE JESUS [RE]',
      'MISIONEROS DEL 2000 [RE]', 'ALMA DE CRISTO [RE]', 'YO TENGO FE [RE]',
      'QUÉ MISIÓN TAN GRANDE [DO]', 'EL SEÑOR ES MI PASTOR [SOL]', 'UNA LUZ [DO]',
      'POR LA SENDA [LA]', 'PAZ EN LA TORMENTA [RE]', 'SI AMO MI VIDA [SI]',
      'CAMINO VERDAD Y VIDA [MI]', 'CONFÍO EN TI [MI]',
      'ESTÁS DENTRO DE MÍ [MI]', 'ENTRE TUS MANOS [MI]',
      'PEQUEÑAS ACLARACIONES [LA]', 'VIDA EN ABUNDANCIA [MI]',
      'AMAR Y MÁS AMAR [LA]', 'MAESTRO BUENO [LA]',
    ],
  },
  {
    name: 'MARÍA',
    songs: [
      'MAGNIFICAT [SOL]', 'QUIERO DECIR QUE SI [LA]', 'LA ELEGIDA [RE]',
      'UN DIA DEL CIELO UN ANGEL [MI]', 'VIRGEN DEL CARMEN BELLA [DO]',
      'NUESTRA SRA. DE AMERICA [LAM]', 'JUNTO A TI MARIA [RE]',
      'MARÍA DE NAZARET [DO]', 'MARIA ES ESA MUJER [SOL]',
      'MADRE DEL SILENCIO [LAM]', 'MADRE DE LOS JOVENES [REM]',
      'CANTICO DE MARIA [RE]', 'SANTA MARIA DEL CAMINO [DO]', 'MARIA MIRAME [DO]',
      'MADRE DEL MUNDO [DO]', 'SANTA MARIA DEL AMEN [LAM]',
      'VENID Y VAMOS TODOS [SOL]', 'VEN Y REINA [DO]', 'MARIA DE LA ALIANZA [LA]',
      'OH MARIA [MI]', 'ACORDES MISTERIOS [RE]', 'CONTIGO MARIA [RE]',
      'AVE MARIA [DO]', 'DIJISTE SI [DO]', 'DIOS TE SALVE MARIA [LA]',
      'REINA DEL TAMARUGAL [MIM]', 'STA. MARIA DE LA ESPERANZA [MIM]',
      'MARIA AUXILIADORA [RE]', 'OH MARIA, MADRE MIA [LA]', 'MIRA QUE TE MIRA [SOL]',
      'EN FÁTIMA APARECISTE [LA]', 'MISTERIOS [LA]', 'MARAVILLAS HIZO EN MÍ [LAM]',
    ],
  },
  {
    name: 'ESPÍRITU SANTO',
    songs: [
      'FUEGO DE DIOS [RE]', 'ESPÍRITU SANTO VEN [RE]', 'ESPÍRITU DE DIOS [MIM]',
      'ESPIRITU SANTO VEN AQUÍ [RE]', 'DULCE HUESPED [RE]', 'INUNDA MI SER [DO]',
      'VEN, VEN ESPIRITU DIVINO [LAM]', 'VEN ESPIRITU DE SANTIDAD [REM]',
      'QUEDATE EN MI [RE]', 'SECUENCIA PENTECOSTES [DO]',
      'VEN ESPIRITU DE DIOS [SOL]',
    ],
  },
  {
    name: 'NAVIDAD',
    songs: [
      'A LAS DOCE DE LA NOCHE [LA]', 'GLORIACANTAN [RE]', 'SALMO: [DO]',
      'VAYAMOS CRISTIANOS [DO]', 'EL TAMBORILERO [DO]', 'BURRITO SABANERO [RE]',
      'NACE UN NIÑO EN UN PORTAL [LA]', 'GLORIA CANTAD [SOL]',
      'LA RONDA DE LA ESTRELLA [SOL]', 'NOCHE DE PAZ [SOL]',
      'CAMPANA SOBRE CAMPANA [SOL]', 'VEN A CANTAR [RE]',
      'ORACION DE NAVIDAD [RE]', '(JESUS HECHO NIÑO) [MIM]',
      'CANTEN CON GOZO [DO]', 'SALMO NAVIDAD [DO]', 'LA PEREGRINACIÓN [LA]',
    ],
  },
  {
    name: 'ANIMACIÓN',
    songs: [
      'ALZAD LAS MANOS [LA]', 'ESTA ES LA GENTE QUE ALABA [DO]',
      'VAMOS A ALABAR AL SEÑOR [DO]', 'SI TUVIERAS FE [RE]',
      'EL AMOR DE DIOS [DO]', 'YO TENGO UN AMIGO [LA]', 'MIS MANOS [MI]',
      'MI DIOS ESTÁ VIVO [RE]', 'VIVA LA FE [DO]',
    ],
  },
  {
    name: 'ADORACIÓN',
    songs: ['CANTEMOS AL AMOR [DO]', 'ADOREMOS [SEGÚN PARTITURA]'],
  },
  {
    name: 'ORACIÓN POR CHILE',
    songs: ['CHILE UNA MESA PARA TODOS [RE]', 'VEN SR. DE LAS ALTAS MONTAÑAS [SIM]'],
  },
  {
    name: 'DÍA DEL PADRE / MADRE',
    songs: [
      'MAMÁ, MAMÁ (LOS NOCHEROS) [LAM]', 'CUANTO TRABAJO (MERCEDES SOSA) [MIM]',
      'HOY HE VUELTO [LA]', 'VIEJO MI QUERIDO VIEJO (PIERO) [LAM]',
      'CON UNA PALA Y UN SOMBRERO [MI]', 'GRACIAS A LA VIDA [LAM]',
    ],
  },
  {
    name: 'HIMNOS',
    songs: [
      'CANTO A SANTA RITA [DO]', 'CANCION A SAN JUAN BAUTISTA [MI]',
      'HIMNO SANTA TERESA [LA]', 'HIMNO A SANTA CLARA [DO]',
      'CLARA, HIJA DE LUZ [MI]', 'EL TALLER DE NAZARETH [LA]', 'CRUZ DE MAYO [LA]',
    ],
  },
  {
    name: 'MIÉRCOLES DE CENIZA',
    songs: ['CON ESTAS CENIZAS [SIM]', 'PERDON OH DIOS MIO [MIM]'],
  },
  {
    name: 'JUEVES SANTO',
    songs: ['LAVA MIS PIES SEÑOR [SOL]'],
  },
  {
    name: 'VIGILIA PASCUAL',
    songs: [
      'PREGÓN PASCUAL [RE]', 'SALMO 103 [SOL]', 'SALMO 15 [RE]', 'EXODO 15 [RE]',
      'SALMO 29 [FA#M]', 'ISAIAS 12 [SOL]', 'SALMO 18 [SIM]', 'SALMO 41 [MI]',
      'EPISTOLA [RE]',
    ],
  },
  {
    name: 'FUNERALES',
    songs: ['RECIBAN SU ALMA [DO]', 'EL SEÑOR ES MI PASTOR [SOL]'],
  },
  {
    name: 'CANCIONES FRANCISCANAS',
    songs: [
      'TODO HOMBRE SIMPLE [RE]', 'NUESTRO IDEAL [LA]', 'FRANCISCO HOY [DO]',
      'SEMBRANDO PAZ, SEMBRANDO BIEN [RE]', 'LE LLAMAN JESÚS [SOL]',
      'TÚ, MI PILAR [DO]', '¿QUÉ MÁS QUIERES? [SOL]', 'SI NO CUESTA NADA [RE]',
      'SI CONOCIERAS EL DON DE DIOS [DO]', 'DULCE MARÍA [DO]',
      'HIMNO MISIÓN 2000 [RE]', 'PAZ EN LA TORMENTA [RE]',
      'EN MI DEBILIDAD [RE]', 'A TI, OH DIOS [DOM]',
      'RENACER EN LIBERTAD [SOLM]', 'PLEGARIA SIMPLE [DO]', 'TANTOS HOMBRES [LA]',
      'TE ALABO A TI [DO]', 'PADRE AMERINDIO [SOL]',
      'PADRE NUESTRO MISIONERO [SOL]', 'ESTA ES LA GENTE QUE ALABA [DO]',
      'TRES COSAS TIENE EL AMOR [DO]', 'NADIE TE AMA COMO YO [DO]',
      'CANTA FRANCISCO [DO]', 'SÍGUEME, SOY CAMINO [DO]',
      'CANTA CON NOSOTROS [SOL]', 'SANTA MARÍA DE LA ESPERANZA [MIM]',
      'DONDE HAY AMOR Y CARIDAD [RE]', 'QUE SEA LA PAZ [DO]',
      'DIOS ESTÁ AQUÍ [DO]', 'POR LOS NIÑOS [LA]', 'JESÚS ESTOY AQUÍ [DO]',
      'PADRE NUESTRO CANTADO [DO]', 'ME TOCASTE JESÚS [SOL]', 'TUYO SOY [RE]',
      'ACLARO [DO]', 'SALMO DE LA CREACION [SOL]', 'NO FIJÉIS LOS OJOS [DO]',
      'ALZAD LAS MANOS [LA]', 'TENEMOS TANTO [SOL]', 'CRISTO ESTÁ PRESENTE [MI]',
      'ROCK DEL ESPÍRITU [LA]', 'GRANITO DE MOSTAZA [RE]',
      'VEN Y SÍGUEME [SOL]', 'ESTOY CONFIANDO [RE]',
      'VEN Y SÍGUEME (MAESTRO BUENO) [LA]', 'EL ALFARERO [DO]',
      'YO TE ALABO CON EL CORAZÓN [RE]', 'YO TENGO UN GOZO EN EL ALMA [RE]',
      'ALELUYA DEL AMOR [MI]', 'AMAOS [RE]', 'CRISTOS JÓVENES [LA]',
      'VIVA LA GENTE [SOL]', 'DEN GLORIA A DIOS [SOL]',
      'HIMNO DE LA ALEGRÍA [LA]', 'RENDID A YAVÉ [RE]',
      'HACES NUEVAS TODAS LAS COSAS [LA]', 'LA CANCIÓN DEL MISIONERO [MI]',
      'JUNTO A TI MARÍA [RE]', 'CANTA MI ALMA AL SEÑOR [SOL]', 'EL APÓSTOL [DO]',
      'ABRE TU JARDÍN [RE]', 'JESUCRISTO [REM]', 'ALÉGRATE JERUSALÉN [RE]',
      'BENDECID A DIOS [DO]', 'CONSOLAD [DO]', 'EN TI, EN TI [RE]',
      'QUÉ BELLO ES [DO]',
    ],
  },
];

// Chord token detector for Spanish & English guitar chords
const CHORD_TOKEN_RE = /^(?:[([¿]*)(?:Do|Re|Mi|Fa|Sol|La|Si|DO|RE|MI|FA|SOL|LA|SI|do|re|mi|fa|sol|la|si|[A-G])(?:#|b)?(?:m|M|maj|min|dim|aug|sus|add)?[0-9]*(?:\/(?:Do|Re|Mi|Fa|Sol|La|Si|DO|RE|MI|FA|SOL|LA|SI|do|re|mi|fa|sol|la|si|[A-G])(?:#|b)?m?)?(?:[.,):;\]]*)$/;

function isSingleChordItem(it) {
  const t = it.s.trim();
  if (!t) return false;
  const tokens = t.split(/[\s–—-]+/).filter(Boolean);
  if (tokens.length === 0) return false;
  const allChords = tokens.every((tok) => CHORD_TOKEN_RE.test(tok) || /^(?:\(bis\)|x\d+|bis)$/i.test(tok));
  if (!allChords) return false;
  if (it.h <= 12.2) return true;
  // Avoid mistaking lowercase/titlecase Spanish words like "A", "E", "La", "Si" at lyric font size
  if (tokens.length === 1 && /^(A|E|La|la|Si|si|Mi|mi|Fa|Do)$/.test(tokens[0])) return false;
  return true;
}

function isChordLineText(text) {
  const cleaned = text.trim();
  if (!cleaned) return false;
  const tokens = cleaned.split(/[\s–—-]+/).filter(Boolean);
  if (tokens.length === 0) return false;
  let chordCount = 0;
  for (const tok of tokens) {
    if (CHORD_TOKEN_RE.test(tok) || /^(?:\(bis\)|x\d+|bis)$/i.test(tok)) {
      chordCount++;
    }
  }
  return chordCount > 0 && chordCount / tokens.length >= 0.75;
}

function buildAlignedLine(items, baseLeftX) {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  const CHAR_PX = 4.6;
  let out = '';
  for (const it of sorted) {
    const t = it.s.trim().replace(/\b(do|re|fa|sol|la|Do|Re|Fa|Sol|La|DO|RE|FA|SOL|LA)#\s+m\b/g, '$1#m');
    const col = Math.max(0, Math.round((it.x - baseLeftX) / CHAR_PX));
    if (out.length < col) {
      out += ' '.repeat(col - out.length);
    } else if (out.length > 0 && !out.endsWith(' ')) {
      out += ' ';
    }
    out += t;
  }
  return out;
}

function parseColumnItems(colItems) {
  if (colItems.length === 0) return [];

  // Pre-merge split sharp chords like "do#" + "m" on same y within 20pt
  const preSorted = [...colItems].sort((a, b) => b.y - a.y || a.x - b.x);
  const merged = [];
  for (const it of preSorted) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      Math.abs(prev.y - it.y) <= 2 &&
      /#$/.test(prev.s.trim()) &&
      /^(?:m|m7|7|M)$/i.test(it.s.trim()) &&
      it.x - prev.x <= 24
    ) {
      prev.s = prev.s.trim() + it.s.trim();
      continue;
    }
    merged.push({ ...it });
  }

  // Group by y within 2.5pt AND keep chord-items separate from lyric-items when their y differs slightly
  const rows = [];
  for (const it of merged) {
    const itemIsChord = isSingleChordItem(it);
    const last = rows[rows.length - 1];
    if (last && Math.abs(last.y - it.y) <= 2.5 && last.isChordRow === itemIsChord) {
      last.items.push(it);
    } else {
      rows.push({ y: it.y, isChordRow: itemIsChord, items: [it] });
    }
  }

  const baseLeftX = Math.min(...merged.map((i) => i.x));
  const rawLines = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const itemsSorted = [...r.items].sort((a, b) => a.x - b.x);
    const plainText = itemsSorted.map((it) => it.s.trim()).join(' ').replace(/\s+/g, ' ').trim();
    if (!plainText) continue;

    const avgH = itemsSorted.reduce((s, it) => s + it.h, 0) / itemsSorted.length;
    const isChord =
      r.isChordRow ||
      (avgH <= 12.2 && isChordLineText(plainText)) ||
      (isChordLineText(plainText) && !/^(A|E|La|Si|Sol|Mi|Fa|Do)$/i.test(plainText));

    const gapFromPrev = i > 0 ? rows[i - 1].y - r.y : 0;
    rawLines.push({
      y: r.y,
      isChord,
      gapFromPrev,
      text: isChord ? buildAlignedLine(itemsSorted, baseLeftX) : plainText,
      items: itemsSorted,
    });
  }

  // Convert rawLines into structured lines: { chords?: string, lyric: string, stanzaBreak?: boolean }
  const structured = [];
  for (let i = 0; i < rawLines.length; i++) {
    const cur = rawLines[i];
    if (cur.isChord) {
      const next = rawLines[i + 1];
      if (next && !next.isChord && cur.y - next.y <= 26) {
        structured.push({
          chords: cur.text.trimEnd(),
          lyric: next.text,
          stanzaBreak: cur.gapFromPrev >= 22,
        });
        i++;
      } else {
        structured.push({
          chords: cur.text.trimEnd(),
          lyric: '',
          stanzaBreak: cur.gapFromPrev >= 22,
        });
      }
    } else {
      structured.push({
        lyric: cur.text,
        stanzaBreak: cur.gapFromPrev >= 20,
      });
    }
  }
  return structured;
}

function parsePageBody(items, isFirstPage) {
  // Filter out top header (y >= 755), footer (y <= 30), and if first page also title & TONO INICIAL (y >= 696)
  const topCutoff = isFirstPage ? 696 : 750;
  const body = items.filter((i) => i.s.trim() && i.y > 30 && i.y < topCutoff);
  if (body.length === 0) return [];

  // Detect two-column page: check if there are multiple distinct y rows with items starting at x >= 305
  // AND the left column items don't cross x=305 continuously (i.e. right column has own left-aligned margin >= 305)
  const rightItems = body.filter((i) => i.x >= 305);
  const rightYSet = new Set(rightItems.map((i) => Math.round(i.y / 6)));
  const leftItems = body.filter((i) => i.x < 305);
  // Check if left items have text wider than x=300 (single-column long lines)
  const longLeftLyric = leftItems.some((i) => i.s.length > 35 && i.x < 100 && i.x + i.s.length * 5.2 > 315);
  // Also check if rightItems contain non-chord lyric text (length > 10 or spaces) at a consistent column x
  const hasRightLyrics = rightItems.filter((i) => !isChordLineText(i.s) && i.s.trim().length > 4).length >= 2;

  if (rightYSet.size >= 4 && hasRightLyrics && !longLeftLyric) {
    // Find column split X between 280 and 350
    const splitX = 305;
    const col1 = body.filter((i) => i.x < splitX);
    const col2 = body.filter((i) => i.x >= splitX);
    return [...parseColumnItems(col1), { lyric: '', stanzaBreak: true }, ...parseColumnItems(col2)];
  }

  return parseColumnItems(body);
}

async function main() {
  const data = new Uint8Array(fs.readFileSync('public/assets/aistudio/Cancionero_San_Francisco_V3_e620e0a8.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  let currentCatIdx = -1;
  const parsedByCat = CANONICAL_CATEGORIES.map((c) => ({ name: c.name, songs: [] }));

  for (let p = 4; p <= 504; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const items = content.items
      .map((it) => ({
        s: it.str,
        x: Math.round(it.transform[4]),
        y: Math.round(it.transform[5]),
        h: Math.round(it.height),
      }))
      .filter((i) => i.s.trim());

    const chItem = items.find((i) => i.s.startsWith('CHAPTER::'));
    if (chItem) {
      const chNum = Number(chItem.s.split('::')[1]);
      currentCatIdx = chNum - 1;
      continue;
    }

    if (currentCatIdx < 0 || currentCatIdx >= CANONICAL_CATEGORIES.length) continue;

    const tonoItem = items.find((i) => i.s.startsWith('TONO INICIAL:'));
    if (tonoItem) {
      const title = items
        .filter((i) => i.y >= 714 && i.y <= 750 && i.h >= 12)
        .map((i) => i.s)
        .join(' ')
        .trim();
      const tone = tonoItem.s.replace('TONO INICIAL:', '').trim();
      const lines = parsePageBody(items, true);
      parsedByCat[currentCatIdx].songs.push({
        pdfTitle: title,
        pdfTone: tone,
        pageStart: p,
        lines,
      });
    } else {
      // Continuation page for the previous song in this chapter
      const prev = parsedByCat[currentCatIdx].songs.at(-1);
      if (prev) {
        const contLines = parsePageBody(items, false);
        if (contLines.length > 0) {
          prev.lines.push({ lyric: '', stanzaBreak: true }, ...contLines);
        }
      }
    }
  }

  // Merge strictly with CANONICAL_CATEGORIES order and exact labels
  const categories = CANONICAL_CATEGORIES.map((cat, catIdx) => {
    const pdfSongs = parsedByCat[catIdx].songs;
    if (pdfSongs.length !== cat.songs.length) {
      throw new Error(`Count mismatch in ${cat.name}: expected ${cat.songs.length}, got ${pdfSongs.length}`);
    }
    return {
      id: `cat-${String(catIdx + 1).padStart(2, '0')}`,
      order: catIdx + 1,
      name: cat.name,
      songs: cat.songs.map((entry, songIdx) => {
        const m = entry.match(/^(.*)\s+\[([^\]]+)\]$/);
        const title = m ? m[1].trim() : entry;
        const tone = m ? m[2].trim() : pdfSongs[songIdx].pdfTone;
        const rawLines = pdfSongs[songIdx].lines.filter((l, idx) => !(idx === 0 && !l.lyric && !l.chords));
        // Clean consecutive blank lines
        const lines = [];
        for (const l of rawLines) {
          if (!l.lyric && !l.chords && lines.length > 0 && !lines.at(-1).lyric && !lines.at(-1).chords) continue;
          lines.push(l);
        }
        return {
          id: `${catIdx + 1}-${songIdx + 1}`,
          categoryIndex: catIdx,
          categoryName: cat.name,
          numberInCategory: songIdx + 1,
          title,
          tone,
          rawLabel: entry,
          lines,
        };
      }),
    };
  });

  const emptySongs = [];
  let totalSongs = 0;
  for (const c of categories) {
    for (const s of c.songs) {
      totalSongs++;
      if (s.lines.length === 0) emptySongs.push(s.id + ' ' + s.rawLabel);
    }
  }

  fs.mkdirSync(path.join(process.cwd(), 'src/data'), { recursive: true });
  fs.writeFileSync(
    path.join(process.cwd(), 'src/data/songbook.json'),
    JSON.stringify({ categories }, null, 0),
    'utf8'
  );

  console.log(`Extracted ${categories.length} categories, ${totalSongs} songs.`);
  console.log('Empty songs:', emptySongs.length, emptySongs);
  // Spot check first song, a 2-page song, and a 2-column song
  console.log('Sample 1 (ABRE TU JARDIN):', JSON.stringify(categories[0].songs[0].lines.slice(0, 6)));
  console.log('Sample 2 (TRES COSAS TIENE EL AMOR):', JSON.stringify(categories[0].songs[7].lines.slice(0, 8)));
  console.log('Sample 3 (PREGÓN PASCUAL lines):', categories[21].songs[0].lines.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

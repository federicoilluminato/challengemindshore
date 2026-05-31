import 'server-only';

import type { NasaSearchOutput } from '@/lib/schemas/nasa';

const ROVER_LIST = ['curiosity', 'opportunity', 'spirit', 'perseverance'] as const;
type RoverName = (typeof ROVER_LIST)[number];

const SPANISH_ROVERS: Record<string, RoverName> = {
  curiosidad: 'curiosity',
  oportunidad: 'opportunity',
  oppie: 'opportunity',
  espíritu: 'spirit',
  perseverancia: 'perseverance',
  percy: 'perseverance',
};

const KNOWN_CAMERAS = ['fhaz', 'rhaz', 'navcam', 'mastcam', 'pancam', 'minites', 'chemcam', 'mahli', 'mardi', 'eecam', 'pixl', 'sherloc', 'watson', 'supercam', 'mastcam-z', 'meda', 'moxie', 'mcs', 'hazcam', 'front hazcam', 'rear hazcam'];

const ES_TO_EN: Record<string, string> = {
  marte: 'mars',
  atardecer: 'sunset',
  atardeceres: 'sunset',
  amanecer: 'sunrise',
  amaneceres: 'sunrise',
  cráter: 'crater',
  cráteres: 'crater',
  crater: 'crater',
  roca: 'rock',
  rocas: 'rock',
  cielo: 'sky',
  polvo: 'dust',
  atmósfera: 'atmosphere',
  atmosfera: 'atmosphere',
  paisaje: 'landscape',
  paisajes: 'landscape',
  duna: 'dune',
  dunas: 'dune',
  huella: 'track',
  huellas: 'track',
  rueda: 'wheel',
  ruedas: 'wheel',
  tormenta: 'storm',
  tormentas: 'storm',
  sombra: 'shadow',
  sombras: 'shadow',
  montaña: 'mountain',
  montañas: 'mountain',
  colina: 'hill',
  colinas: 'hill',
  horizonte: 'horizon',
  luz: 'light',
  sol: 'sun',
  estrella: 'star',
  estrellas: 'star',
  nave: 'spacecraft',
  planeta: 'planet',
  planetas: 'planets',
  tierra: 'earth',
  luna: 'moon',
  satélite: 'satellite',
  orbita: 'orbit',
  misión: 'mission',
  misiones: 'mission',
  exploración: 'exploration',
  exploracion: 'exploration',
  descubrimiento: 'discovery',
  científico: 'science',
  cientifico: 'science',
  cámara: 'camera',
  camara: 'camera',
  foto: '',
  fotos: '',
  imagen: '',
  imágenes: '',
  imagenes: '',
};

function extractRover(text: string): RoverName | undefined {
  const lower = text.toLowerCase();
  for (const name of ROVER_LIST) {
    if (lower.includes(name)) return name;
  }
  for (const [spanish, english] of Object.entries(SPANISH_ROVERS)) {
    if (lower.includes(spanish)) return english;
  }
  if (lower.includes('curious')) return 'curiosity';
  return undefined;
}

function extractCamera(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const cam of KNOWN_CAMERAS) {
    if (lower.includes(cam)) return cam.toUpperCase();
  }
  return undefined;
}

function extractDate(text: string): string | undefined {
  const patterns: RegExp[] = [
    /\b(\d{4})-(\d{2})-(\d{2})\b/,
    /\b(\d{4})\/(\d{2})\/(\d{2})\b/,
    /\b(\d{1,2})\s*de\s+\w+\s+de\s+(\d{4})\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const date = new Date(match[0]);
        const iso = date.toISOString().split('T')[0];
        if (iso) return iso;
      } catch {
        continue;
      }
    }
  }

  return undefined;
}

function extractMission(text: string): string | undefined {
  const lower = text.toLowerCase();
  const missionPatterns: [RegExp, string][] = [
    [/mars\s*2020/i, 'mars 2020'],
    [/msl/i, 'msl'],
    [/mex/i, 'mars express'],
    [/mer[-\s]?[ab]?/i, 'mer'],
  ];

  for (const [regex, mission] of missionPatterns) {
    if (regex.test(lower)) return mission;
  }

  return undefined;
}

export type SemanticSearchInterpretation = {
  originalQuery: string;
  interpreted: NasaSearchOutput;
};

export function interpretNaturalLanguage(query: string): SemanticSearchInterpretation {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      originalQuery: query,
      interpreted: {
        query: '',
        mission: undefined,
        rover: undefined,
        camera: undefined,
        date: undefined,
        page: 1,
      },
    };
  }

  const rover = extractRover(trimmed);
  const camera = extractCamera(trimmed);
  const date = extractDate(trimmed);
  const mission = extractMission(trimmed);

  let cleanQuery = trimmed;

  for (const name of ROVER_LIST) {
    cleanQuery = cleanQuery.replace(new RegExp(name, 'ig'), '');
  }
  for (const [spanish, _rover] of Object.entries(SPANISH_ROVERS)) {
    cleanQuery = cleanQuery.replace(new RegExp(spanish, 'ig'), '');
  }
  for (const cam of KNOWN_CAMERAS) {
    cleanQuery = cleanQuery.replace(new RegExp(cam.replace(/[- ]/g, '[- ]'), 'ig'), '');
  }

  cleanQuery = cleanQuery.replace(/\b(?:mostrame|buscame|quiero ver|dame|enseñame|muestra|buscar|encuentra|fotos?\s*de|imágenes?\s*de|del?\s+)\b/gi, '');
  cleanQuery = cleanQuery.replace(/[,\s]+/g, ' ').trim();

  for (const [es, en] of Object.entries(ES_TO_EN)) {
    cleanQuery = cleanQuery.replace(new RegExp(`\\b${es}\\b`, 'gi'), en);
  }
  cleanQuery = cleanQuery.replace(/\s+/g, ' ').trim();

  if (!cleanQuery && rover) {
    cleanQuery = rover;
  }

  const interpreted: NasaSearchOutput = {
    query: cleanQuery.length >= 2 ? cleanQuery : '',
    mission: mission ?? undefined,
    rover: rover,
    camera: camera,
    date: date,
    page: 1,
  };

  return { originalQuery: query, interpreted };
}

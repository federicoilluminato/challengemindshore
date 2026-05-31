import type { NasaSearchOutput } from '@/lib/schemas/nasa';

const ROVER_LIST = ['curiosity', 'opportunity', 'spirit', 'perseverance'] as const;
type RoverName = (typeof ROVER_LIST)[number];

const KNOWN_CAMERAS = ['fhaz', 'rhaz', 'navcam', 'mastcam', 'pancam', 'minites', 'chemcam', 'mahli', 'mardi', 'eecam', 'pixl', 'sherloc', 'watson', 'supercam', 'mastcam-z', 'meda', 'moxie', 'mcs', 'hazcam', 'front hazcam', 'rear hazcam'];

function extractRover(text: string): RoverName | undefined {
  const lower = text.toLowerCase();
  for (const name of ROVER_LIST) {
    if (lower.includes(name)) return name;
  }
  if (lower.includes('curious')) return 'curiosity';
  if (lower.includes('oppie')) return 'opportunity';
  if (lower.includes('percy')) return 'perseverance';
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
  for (const cam of KNOWN_CAMERAS) {
    cleanQuery = cleanQuery.replace(new RegExp(cam.replace(/[- ]/g, '[- ]'), 'ig'), '');
  }

  cleanQuery = cleanQuery.replace(/\b(?:mostrame|buscame|quiero ver|dame|enseñame|muestra|buscar|encuentra|fotos?\s*de|imágenes?\s*de|del?\s+|show me|find|give me|i want|i need|pictures of|photos of|images of|of the|of a)\b/gi, '');
  cleanQuery = cleanQuery.replace(/\b(?:show|me|find|give|want|need|the|a|an|of|for|with|and|in|on|at|to|by|from|all)\b/gi, '');
  cleanQuery = cleanQuery.replace(/[,\s]+/g, ' ').trim();

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

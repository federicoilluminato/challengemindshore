import 'server-only';

import type { NasaSearchInput } from '@/lib/schemas/nasa';

export type NasaSearchResult = {
  id: string;
  nasaId: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string | null;
  source: 'mars-rover' | 'image-library';
  rover?: string;
  camera?: string;
  mission?: string;
  pageUrl?: string;
};

type MarsRoverApiResponse = {
  photos: Array<{
    id: number;
    img_src: string;
    earth_date: string;
    camera?: { name?: string; full_name?: string };
    rover?: { name?: string };
  }>;
};

type NasaImageLibraryResponse = {
  collection: {
    items: Array<{
      href?: string;
      data?: Array<{
        nasa_id?: string;
        title?: string;
        description?: string;
        date_created?: string;
      }>;
      links?: Array<{ href?: string }>;
    }>;
  };
};

const NASA_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

function buildUrl(path: string, params: Record<string, string | number | undefined>) {
  const url = new URL(`https://api.nasa.gov${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  url.searchParams.set('api_key', NASA_KEY);
  return url;
}

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`NASA API returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function normalizeDescription(description?: string) {
  if (!description) return 'No description available.';
  return description.trim().length > 0 ? description : 'No description available.';
}

async function searchMarsRoverPhotos(input: NasaSearchInput) {
  if (!input.rover || !input.date) return [];

  const url = buildUrl(`/mars-photos/api/v1/rovers/${input.rover}/photos`, {
    earth_date: input.date,
    camera: input.camera?.toLowerCase(),
    page: input.page,
  });

  const data = await fetchJson<MarsRoverApiResponse>(url);

  return data.photos.map<NasaSearchResult>((photo) => ({
    id: `mars-${photo.id}`,
    nasaId: String(photo.id),
    title: `${photo.rover?.name ?? input.rover} photo #${photo.id}`,
    description: `Captured on ${photo.earth_date}${photo.camera?.full_name ? ` with ${photo.camera.full_name}` : ''}.`,
    imageUrl: photo.img_src,
    date: photo.earth_date,
    source: 'mars-rover',
    rover: photo.rover?.name ?? input.rover,
    camera: photo.camera?.full_name ?? photo.camera?.name ?? input.camera,
  }));
}

async function searchImageLibrary(input: NasaSearchInput) {
  const searchTerms = [input.query, input.mission, input.rover, input.camera].filter(Boolean).join(' ');
  const year = input.date ? new Date(`${input.date}T00:00:00.000Z`).getUTCFullYear() : undefined;

  const url = new URL('https://images-api.nasa.gov/search');

  for (const [key, value] of Object.entries({
    q: searchTerms || undefined,
    media_type: 'image',
    year_start: year,
    year_end: year,
    page: input.page,
  })) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const data = await fetchJson<NasaImageLibraryResponse>(url);

  return data.collection.items
    .map<NasaSearchResult | null>((item) => {
      const asset = item.data?.[0];
      const imageUrl = item.links?.find((link) => link.href)?.href;

      if (!asset?.nasa_id || !asset.title || !imageUrl) return null;

      return {
        id: asset.nasa_id,
        nasaId: asset.nasa_id,
        title: asset.title,
        description: normalizeDescription(asset.description),
        imageUrl,
        date: asset.date_created ?? null,
        source: 'image-library',
        mission: input.mission,
      };
    })
    .filter((item): item is NasaSearchResult => item !== null);
}

export async function searchNasa(input: NasaSearchInput) {
  const [roverResults, libraryResults] = await Promise.all([searchMarsRoverPhotos(input), searchImageLibrary(input)]);
  const results = [...roverResults, ...libraryResults];

  const deduped = new Map<string, NasaSearchResult>();

  for (const result of results) {
    if (!deduped.has(result.imageUrl)) {
      deduped.set(result.imageUrl, result);
    }
  }

  return Array.from(deduped.values()).slice(0, 30);
}

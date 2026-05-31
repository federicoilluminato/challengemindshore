import 'server-only';

import { getOpenAIClient } from '@/lib/openai';
import type { NasaEnrichmentInput } from '@/lib/schemas/enrichment';

export type NasaAiEnrichment = {
  summary: string;
  facts: string[];
  tags: string[];
};

function cleanText(value: string | undefined | null) {
  return (value ?? '').trim();
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function splitTerms(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2);
}

function getSearchText(input: NasaEnrichmentInput) {
  return [
    input.title,
    input.description ?? '',
    input.rover ?? '',
    input.camera ?? '',
    input.mission ?? '',
    input.center ?? '',
    input.photographer ?? '',
    input.location ?? '',
    ...(input.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase();
}

function getMetadataContext(input: NasaEnrichmentInput) {
  return unique([
    input.source === 'mars-rover' ? 'Mars rover image' : 'NASA image library record',
    input.date ? `date ${input.date}` : '',
    input.rover ? `rover ${input.rover}` : '',
    input.camera ? `camera ${input.camera}` : '',
    input.mission ? `mission ${input.mission}` : '',
    input.center ? `center ${input.center}` : '',
    input.photographer ? `credit ${input.photographer}` : '',
    input.location ? `location ${input.location}` : '',
    ...(input.keywords ?? []).slice(0, 4),
  ]).join(' · ');
}

function inferThemes(input: NasaEnrichmentInput) {
  const text = getSearchText(input);
  const themes: string[] = [];

  if (text.includes('mars')) themes.push('Mars exploration');
  if (text.includes('sunset') || text.includes('sun rise') || text.includes('dusk') || text.includes('twilight')) {
    themes.push('Martian twilight');
  }
  if (text.includes('pathfinder')) themes.push('Pathfinder archive');
  if (text.includes('rover') || text.includes('lander')) themes.push('robotic surface exploration');
  if (text.includes('dust') || text.includes('atmosphere') || text.includes('sky')) themes.push('atmospheric science');
  if (text.includes('crater') || text.includes('rock') || text.includes('terrain') || text.includes('surface')) themes.push('surface geology');
  if (text.includes('nebula') || text.includes('galaxy') || text.includes('star') || text.includes('galactic')) themes.push('deep space astronomy');

  return unique(themes);
}

function makeFallbackSummary(input: NasaEnrichmentInput) {
  const themes = inferThemes(input);
  const context = getMetadataContext(input);
  const title = cleanText(input.title);

  const sentences = [`This NASA image documents ${title}.`];

  if (themes.includes('Martian twilight')) {
    sentences.push('It is especially useful because Martian sunsets and twilight can reveal how dust and the thin atmosphere scatter light across the sky.');
  }

  if (themes.includes('Pathfinder archive')) {
    sentences.push('The Pathfinder link gives it historical weight, since early Mars archive images helped establish the visual language of robotic exploration on the planet.');
  }

  if (themes.includes('robotic surface exploration') && input.source === 'mars-rover') {
    sentences.push('Rover imagery is valuable not just as a picture, but as mission evidence: it records terrain, lighting, and instrument use in the field.');
  }

  if (!themes.length) {
    sentences.push('The value here is in the broader mission context, which turns a single caption into a useful scientific and historical record.');
  }

  if (context) {
    sentences.push(`Catalog context: ${context}.`);
  }

  return sentences.slice(0, 4).join(' ');
}

function makeFallbackFacts(input: NasaEnrichmentInput) {
  const facts: string[] = [];
  const themes = inferThemes(input);

  facts.push(input.source === 'mars-rover' ? 'Captured by a Mars rover.' : 'Archive record from the NASA image library.');

  if (themes.includes('Martian twilight')) {
    facts.push('Martian sunset scenes help study dust and light scattering in the atmosphere.');
  }

  if (themes.includes('Pathfinder archive')) {
    facts.push("Pathfinder is part of NASA's early Mars mission history and its archive helped define later surface exploration.");
  }

  if (input.center) {
    facts.push(`Cataloged by ${input.center}.`);
  }

  if (input.photographer) {
    facts.push(`Credit: ${input.photographer}.`);
  }

  if (input.location) {
    facts.push(`Location metadata: ${input.location}.`);
  }

  if (input.keywords?.length) {
    facts.push(`Keywords: ${input.keywords.slice(0, 3).join(', ')}.`);
  }

  if (input.date) {
    facts.push(`Date: ${input.date}.`);
  }

  return unique(facts).slice(0, 4);
}

function fallbackTags(input: NasaEnrichmentInput) {
  const text = getSearchText(input);
  const themes = inferThemes(input);
  const tags = unique([
    ...(input.keywords ?? []).map((keyword) => keyword.toLowerCase()),
    input.source === 'mars-rover' ? 'mars' : 'nasa',
    text.includes('sunset') ? 'sunset' : '',
    text.includes('pathfinder') ? 'pathfinder' : '',
    text.includes('dust') ? 'dust' : '',
    text.includes('atmosphere') ? 'atmosphere' : '',
    text.includes('rover') ? 'rover' : '',
    text.includes('camera') ? 'camera' : '',
    text.includes('crater') ? 'crater' : '',
    text.includes('surface') ? 'surface' : '',
    ...themes.map((theme) => theme.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
  ]);

  return tags.slice(0, 5);
}

function normalizeSummary(summary: unknown, input: NasaEnrichmentInput) {
  if (typeof summary !== 'string') {
    return makeFallbackSummary(input);
  }

  const cleaned = summary.trim();
  if (!cleaned) {
    return makeFallbackSummary(input);
  }

  const lower = cleaned.toLowerCase();
  const description = cleanText(input.description).toLowerCase();
  const title = cleanText(input.title).toLowerCase();
  const meaningTerms = ['mission', 'archive', 'history', 'atmosphere', 'dust', 'surface', 'exploration', 'science', 'camera', 'rover', 'lander', 'terrain', 'light'];
  const hasMeaning = meaningTerms.some((term) => lower.includes(term));

  if (lower.startsWith('context:') || lower.startsWith('overview:') || lower.includes('published in the nasa image library')) {
    return makeFallbackSummary(input);
  }

  if (description && lower === description) {
    return makeFallbackSummary(input);
  }

  const overlapSource = unique([...splitTerms(description), ...splitTerms(title)]).filter((term) => term.length > 4);
  const overlap = overlapSource.filter((term) => lower.includes(term)).length;

  if (overlap >= 5 || cleaned.length < 140 || !hasMeaning) {
    return makeFallbackSummary(input);
  }

  return cleaned;
}

function normalizeFacts(facts: unknown, input: NasaEnrichmentInput) {
  if (!Array.isArray(facts)) {
    return makeFallbackFacts(input);
  }

  const description = cleanText(input.description).toLowerCase();
  const cleanedFacts = unique(
    facts
      .filter((fact): fact is string => typeof fact === 'string' && fact.trim().length > 0)
      .map((fact) => fact.trim())
      .filter((fact) => {
        const lower = fact.toLowerCase();
        if (!description) {
          return true;
        }

        const overlap = unique(splitTerms(description)).filter((term) => term.length > 4 && lower.includes(term)).length;
        return overlap < 4;
      }),
  );

  return cleanedFacts.length >= 3 ? cleanedFacts.slice(0, 4) : makeFallbackFacts(input);
}

export async function enrichNasaImage(input: NasaEnrichmentInput): Promise<NasaAiEnrichment> {
  const client = getOpenAIClient();
  const baseFacts = makeFallbackFacts(input);

  if (!client) {
    return {
      summary: makeFallbackSummary(input),
      facts: baseFacts,
      tags: fallbackTags(input),
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.45,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an expert space science curator. Return a JSON object with summary, facts and tags. The summary must be 3-5 sentences and must add information that is not already obvious from the title or description. Focus on historical context, mission purpose, scientific relevance, atmospheric or surface conditions, instrument role, or why the image matters. Do not paraphrase or restate the caption. Facts should be 3-4 short bullet-like statements, each adding one specific new detail. Tags must be short lowercase nouns in English, maximum 5. Prefer concrete observations over generic phrasing. If the input is thin, expand it with the metadata and avoid generic filler.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            title: input.title,
            description: input.description || '',
            source: input.source,
            date: input.date || '',
            rover: input.rover || '',
            camera: input.camera || '',
            mission: input.mission || '',
            keywords: input.keywords ?? [],
            center: input.center || '',
            photographer: input.photographer || '',
            location: input.location || '',
            metadataContext: getMetadataContext(input),
            themes: inferThemes(input),
            guidance:
              'Write like a knowledgeable museum curator explaining why the image matters. Do not repeat the caption. Add historical context, mission background, scientific meaning, instrument purpose, or notable details the caption omits. If the image is from the image library, explain the broader space/science relevance using the metadata and any obvious clues from the title. If the input is thin, infer the most likely scientific context from the title and metadata instead of echoing the description.',
          }),
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty AI response');
    }

    const parsed = JSON.parse(content) as Partial<NasaAiEnrichment>;
    const normalizedSummary = normalizeSummary(parsed.summary, input);
    const normalizedFacts = normalizeFacts(parsed.facts, input);

    return {
      summary: normalizedSummary,
      facts: normalizedFacts.length ? normalizedFacts : baseFacts,
      tags: Array.isArray(parsed.tags)
        ? unique(parsed.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)).slice(0, 5)
        : fallbackTags(input),
    };
  } catch {
    return {
      summary: makeFallbackSummary(input),
      facts: baseFacts,
      tags: fallbackTags(input),
    };
  }
}

import { z } from 'zod';

export const nasaEnrichmentSchema = z.object({
  nasaId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().or(z.literal('')),
  imageUrl: z.string().url(),
  date: z.string().optional().or(z.literal('')),
  source: z.enum(['mars-rover', 'image-library']),
  rover: z.string().optional().or(z.literal('')),
  camera: z.string().optional().or(z.literal('')),
  mission: z.string().optional().or(z.literal('')),
  keywords: z.array(z.string()).optional(),
  center: z.string().optional().or(z.literal('')),
  photographer: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
});

export const saveTagsSchema = nasaEnrichmentSchema.extend({
  tags: z.array(z.string().trim().min(2)).min(1),
});

export type NasaEnrichmentInput = z.infer<typeof nasaEnrichmentSchema>;
export type SaveTagsInput = z.infer<typeof saveTagsSchema>;

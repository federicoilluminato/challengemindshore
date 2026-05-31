import { z } from 'zod';

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const optionalString = (schema: z.ZodString) => z.preprocess(emptyToUndefined, schema.optional().or(z.literal('')));

export const nasaSearchSchema = z.object({
  query: optionalString(z.string().min(2, 'La búsqueda debe tener al menos 2 caracteres').max(120)),
  mission: optionalString(z.string().min(2, 'La misión debe tener al menos 2 caracteres').max(120)),
  rover: z.preprocess(
    emptyToUndefined,
    z.enum(['curiosity', 'opportunity', 'spirit', 'perseverance'], {
      errorMap: () => ({ message: 'Elegí un rover válido' }),
    }).optional().or(z.literal('')),
  ),
  camera: optionalString(z.string().min(2, 'La cámara debe tener al menos 2 caracteres').max(40)),
  date: z.preprocess(
    emptyToUndefined,
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingresá una fecha válida (YYYY-MM-DD)').optional().or(z.literal('')),
  ),
  page: z.coerce.number().int().min(1).max(5).default(1),
});

export type NasaSearchInput = z.infer<typeof nasaSearchSchema>;
export type NasaSearchFormValues = z.input<typeof nasaSearchSchema>;
export type NasaSearchOutput = z.output<typeof nasaSearchSchema>;

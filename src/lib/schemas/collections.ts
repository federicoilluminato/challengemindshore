import { z } from 'zod';

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const createCollectionSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(80, 'El nombre es demasiado largo'),
  description: z.preprocess(emptyToUndefined, z.string().trim().max(240, 'La descripción es demasiado larga').optional().or(z.literal(''))),
});

export const saveCollectionImageSchema = z.object({
  nasaId: z.string().trim().min(1, 'Falta el identificador de NASA'),
  title: z.string().trim().min(1, 'Falta el título'),
  description: z.string().trim().optional().or(z.literal('')),
  imageUrl: z.string().url('La URL de la imagen es inválida'),
  mediaType: z.string().trim().min(1, 'Falta el tipo de media'),
  nasaDate: z.string().trim().optional().or(z.literal('')),
  source: z.string().trim().min(1, 'Falta la fuente'),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type CreateCollectionFormValues = z.input<typeof createCollectionSchema>;
export type CreateCollectionOutput = z.output<typeof createCollectionSchema>;
export type SaveCollectionImageInput = z.infer<typeof saveCollectionImageSchema>;

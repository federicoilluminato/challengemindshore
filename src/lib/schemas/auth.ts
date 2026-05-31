import { z } from 'zod';

const optionalName = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre es demasiado largo')
  .optional()
  .or(z.literal(''));

export const registerSchema = z.object({
  name: optionalName,
  email: z.string().trim().email('Ingresá un email válido').toLowerCase(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72, 'La contraseña es demasiado larga'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Ingresá un email válido').toLowerCase(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

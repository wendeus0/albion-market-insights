import { z } from 'zod';
import { cities, qualities } from '@/data/constants';

export const alertFormSchema = z.object({
  itemId: z.string().min(1, 'Selecione um item'),
  quality: z.enum(qualities),
  city: z.enum(['all', ...cities] as [string, ...string[]]),
  condition: z.enum(['below', 'above', 'change']),
  threshold: z
    .number({ invalid_type_error: 'Digite um número válido' })
    .positive('O valor deve ser positivo')
    .min(0.01, 'Valor mínimo: 0.01'),
  notifications: z.object({
    inApp: z.boolean(),
    email: z.boolean(),
  }),
});

export type AlertFormValues = z.infer<typeof alertFormSchema>;

// Schema para persistência de alertas
// city deve ser 'all' ou uma cidade válida
export const alertSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  itemName: z.string(),
  quality: z.enum(qualities).default('Normal'),
  city: z.enum(['all', ...cities] as [string, ...string[]]),
  condition: z.enum(['below', 'above', 'change']),
  threshold: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  notifications: z.object({
    inApp: z.boolean(),
    email: z.boolean(),
  }),
});

export type AlertSchema = z.infer<typeof alertSchema>;

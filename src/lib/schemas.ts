import { z } from 'zod';
import { cities } from '@/data/constants';

export const alertFormSchema = z.object({
  itemId: z.string().min(1, 'Selecione um item'),
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

export const alertSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  itemName: z.string(),
  city: z.string(),
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

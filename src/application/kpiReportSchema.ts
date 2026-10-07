import { z } from 'zod';
import { KPI_DIRECTIONS, KPI_UNITS } from '@/domain/kpi';

export const MAX_KPIS = 100;

const kpiSchema = z.object({
  id: z.string().trim().min(1).max(64),
  label: z.string().trim().min(1).max(120),
  value: z.number(),
  unit: z.enum(KPI_UNITS),
  direction: z.enum(KPI_DIRECTIONS).default('higher_is_better'),
  previousValue: z.number().optional(),
  target: z.number().optional(),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/, 'Expected an ISO 4217 code such as "USD"')
    .optional(),
});

export const kpiReportSchema = z.object({
  generatedAt: z.iso.datetime({ offset: true }).optional(),
  kpis: z
    .array(kpiSchema)
    .max(MAX_KPIS)
    .refine((kpis) => new Set(kpis.map((k) => k.id)).size === kpis.length, 'KPI ids must be unique'),
});

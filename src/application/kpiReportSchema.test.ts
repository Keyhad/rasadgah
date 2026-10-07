import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MAX_KPIS, kpiReportSchema } from './kpiReportSchema';

const validKpi = { id: 'a', label: 'A', value: 1, unit: 'number' };

describe('kpiReportSchema', () => {
  it('accepts the published example file', () => {
    const example = JSON.parse(
      readFileSync(path.join(process.cwd(), 'public/kpis.example.json'), 'utf8'),
    );
    expect(kpiReportSchema.safeParse(example).success).toBe(true);
  });

  it('defaults direction to higher_is_better', () => {
    const parsed = kpiReportSchema.parse({ kpis: [validKpi] });
    expect(parsed.kpis[0]?.direction).toBe('higher_is_better');
  });

  it.each([
    ['missing kpis', {}],
    ['non-array kpis', { kpis: {} }],
    ['unknown unit', { kpis: [{ ...validKpi, unit: 'parsecs' }] }],
    ['string value', { kpis: [{ ...validKpi, value: '1' }] }],
    ['blank label', { kpis: [{ ...validKpi, label: '  ' }] }],
    ['lowercase currency', { kpis: [{ ...validKpi, currency: 'usd' }] }],
    ['bad timestamp', { generatedAt: 'yesterday', kpis: [] }],
    ['duplicate ids', { kpis: [validKpi, validKpi] }],
    ['too many kpis', { kpis: Array.from({ length: MAX_KPIS + 1 }, (_, i) => ({ ...validKpi, id: `k${i}` })) }],
  ])('rejects %s', (_, input) => {
    expect(kpiReportSchema.safeParse(input).success).toBe(false);
  });
});

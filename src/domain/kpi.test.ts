import { describe, expect, it } from 'vitest';
import { assess, changeRatio, targetStatus, trendOf, type Kpi } from './kpi';

const kpi = (overrides: Partial<Kpi> = {}): Kpi => ({
  id: 'k',
  label: 'KPI',
  value: 110,
  previousValue: 100,
  unit: 'number',
  direction: 'higher_is_better',
  ...overrides,
});

describe('changeRatio', () => {
  it('returns relative change against the previous value', () => {
    expect(changeRatio(kpi())).toBeCloseTo(0.1);
    expect(changeRatio(kpi({ value: 90, previousValue: -100 }))).toBeCloseTo(1.9);
  });

  it('returns null without a usable previous value', () => {
    expect(changeRatio(kpi({ previousValue: undefined }))).toBeNull();
    expect(changeRatio(kpi({ previousValue: 0 }))).toBeNull();
  });
});

describe('trendOf', () => {
  it.each([
    [110, 100, 'up'],
    [90, 100, 'down'],
    [100, 100, 'flat'],
    [100, undefined, 'flat'],
  ] as const)('value %s vs previous %s is %s', (value, previousValue, expected) => {
    expect(trendOf(kpi({ value, previousValue }))).toBe(expected);
  });
});

describe('assess', () => {
  it('treats increases as positive when higher is better', () => {
    expect(assess(kpi())).toBe('positive');
    expect(assess(kpi({ value: 90 }))).toBe('negative');
  });

  it('treats decreases as positive when lower is better', () => {
    expect(assess(kpi({ direction: 'lower_is_better', value: 90 }))).toBe('positive');
    expect(assess(kpi({ direction: 'lower_is_better' }))).toBe('negative');
  });

  it('is neutral when flat', () => {
    expect(assess(kpi({ value: 100 }))).toBe('neutral');
  });
});

describe('targetStatus', () => {
  it('is none without a target', () => {
    expect(targetStatus(kpi())).toBe('none');
  });

  it('respects direction', () => {
    expect(targetStatus(kpi({ target: 110 }))).toBe('met');
    expect(targetStatus(kpi({ target: 120 }))).toBe('missed');
    expect(targetStatus(kpi({ target: 110, direction: 'lower_is_better' }))).toBe('met');
    expect(targetStatus(kpi({ target: 100, direction: 'lower_is_better' }))).toBe('missed');
  });
});

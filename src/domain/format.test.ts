import { describe, expect, it } from 'vitest';
import { formatChange, formatDateTime, formatValue } from './format';

describe('formatValue', () => {
  it('formats plain numbers', () => {
    expect(formatValue(8421.456, { unit: 'number' })).toBe('8,421.46');
  });

  it('formats percentages given in percent points', () => {
    expect(formatValue(3.8, { unit: 'percent' })).toBe('3.8%');
  });

  it('formats currency with a default of USD', () => {
    expect(formatValue(128400, { unit: 'currency' })).toBe('$128,400');
    expect(formatValue(99, { unit: 'currency', currency: 'EUR' })).toBe('€99');
  });

  it('formats durations in ms or seconds', () => {
    expect(formatValue(245, { unit: 'duration_ms' })).toBe('245 ms');
    expect(formatValue(1250, { unit: 'duration_ms' })).toBe('1.25 s');
  });
});

describe('formatChange', () => {
  it('formats signed percentages', () => {
    expect(formatChange(0.095)).toBe('+9.5%');
    expect(formatChange(-0.054)).toBe('-5.4%');
    expect(formatChange(0)).toBe('0%');
  });

  it('renders a dash when change is unknown', () => {
    expect(formatChange(null)).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('formats in UTC', () => {
    expect(formatDateTime('2026-10-07T08:30:00Z')).toBe('Oct 7, 2026, 8:30 AM UTC');
  });
});

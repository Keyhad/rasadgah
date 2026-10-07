import type { Freshness as FreshnessModel } from '@/application/useCases';

export function Freshness({
  updated,
  dataAsOf,
}: {
  updated: FreshnessModel;
  dataAsOf: string | null;
}) {
  return (
    <p className="freshness" data-testid="freshness">
      Updated{' '}
      <time dateTime={updated.iso} title={updated.label}>
        {updated.age}
      </time>{' '}
      <span className="freshness__exact">({updated.label})</span>
      {dataAsOf && <span className="freshness__exact"> · data as of {dataAsOf}</span>}
    </p>
  );
}

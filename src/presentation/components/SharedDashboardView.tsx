import Image from 'next/image';
import type { DashboardViewModel } from '@/application/useCases';
import { Freshness } from './Freshness';
import { KpiGrid } from './KpiGrid';

export const SLOGAN = 'Observe what matters.';

/** Read-token view: only the KPIs and how fresh they are; a full-page brand hero while empty. */
export function SharedDashboardView({ dashboard }: { dashboard: DashboardViewModel }) {
  const { updated, dataAsOf, kpis } = dashboard;
  if (!updated || kpis.length === 0) {
    return (
      <section className="hero" aria-labelledby="hero-slogan">
        <Image
          className="hero__logo"
          src="/brand/logo-dark.svg"
          alt="Rasadgah — KPI observatory"
          width={720}
          height={192}
          priority
          unoptimized
        />
        <p id="hero-slogan" className="hero__slogan">
          {SLOGAN}
        </p>
        <div className="hero__note">
          {updated ? (
            <>
              <p>The latest upload contains no KPIs.</p>
              <Freshness updated={updated} dataAsOf={dataAsOf} />
            </>
          ) : (
            <p>No KPIs published yet.</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <>
      <Freshness updated={updated} dataAsOf={dataAsOf} />
      <KpiGrid kpis={kpis} emptyMessage="" />
    </>
  );
}

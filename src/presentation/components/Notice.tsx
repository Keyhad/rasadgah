import Link from 'next/link';
import type { ReactNode } from 'react';

export function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel notice" role="alert" aria-labelledby="notice-heading">
      <h2 id="notice-heading">{title}</h2>
      {children}
      <p>
        <Link href="/" prefetch={false}>
          Get a new token
        </Link>
      </p>
    </section>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rasadgah · KPI observatory',
  description: 'Observe what matters. Upload KPIs with a personal token and view them as a dashboard.',
  icons: { icon: '/brand/logo-icon.svg' },
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <h1>
            {/* Visiting "/" issues a token, so never prefetch it. */}
            <Link href="/" prefetch={false}>
              <Image src="/brand/logo-icon.svg" alt="" width={32} height={32} unoptimized priority />
              Rasadgah
            </Link>
          </h1>
          <p>KPI observatory</p>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}

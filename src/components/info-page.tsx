import { Suspense } from 'react';
import Link from 'next/link';
import { BackToMap } from './back-to-map';
import { AppearanceMenu } from './appearance-menu';
export function InfoPage({
  label,
  title,
  intro,
  children,
}: {
  label: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="info-page">
      <div className="info-top">
        <Suspense fallback={<Link href="/">Back to the map</Link>}>
          <BackToMap />
        </Suspense>
        <AppearanceMenu />
      </div>
      <div className="info-title">
        <p className="eyebrow">{label}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>
      <div className="info-body">{children}</div>
      <footer className="info-footer">
        <span>Agro Field · Space for local knowledge</span>
        <Link href="/">Open map ↗</Link>
      </footer>
    </main>
  );
}

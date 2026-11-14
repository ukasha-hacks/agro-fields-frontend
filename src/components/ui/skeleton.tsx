import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('skeleton', className)} />;
}

export function ContentSkeleton({
  kind = 'summary',
  label = 'Reading the local archive',
}: {
  kind?: 'summary' | 'history' | 'form' | 'assessment' | 'sources' | 'map';
  label?: string;
}) {
  return (
    <div className={`content-skeleton skeleton-${kind}`} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <Skeleton className="skeleton-heading" />
      <div className="skeleton-columns">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="skeleton-value" />
        ))}
      </div>
      {kind !== 'summary' && <Skeleton className="skeleton-block" />}
      <Skeleton className="skeleton-line" />
      <Skeleton className="skeleton-line short" />
    </div>
  );
}

export function ExplorerSkeleton() {
  return (
    <main className="explorer-shell" aria-label="Loading Agro Field">
      <div className="map-loading">
        <ContentSkeleton kind="map" label="Opening Agro Field" />
      </div>
      <div className="map-search">
        <Skeleton className="skeleton-search" />
      </div>
      <div className="area-card">
        <ContentSkeleton />
      </div>
    </main>
  );
}

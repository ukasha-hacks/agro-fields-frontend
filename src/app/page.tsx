import { Suspense } from 'react';
import { Explorer } from '@/components/explorer';
import { ExplorerSkeleton } from '@/components/ui/skeleton';
export default function Home() {
  return (
    <Suspense fallback={<ExplorerSkeleton />}>
      <Explorer />
    </Suspense>
  );
}

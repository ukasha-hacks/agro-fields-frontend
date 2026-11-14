import { Suspense } from 'react';
import { Explorer } from '@/components/explorer';
export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center text-sm text-muted">
          Opening Agro Field…
        </main>
      }
    >
      <Explorer />
    </Suspense>
  );
}

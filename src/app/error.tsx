'use client';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="info-page">
      <section className="status-message error mt-10" role="alert">
        <AlertCircle size={20} />
        <div>
          <h1 className="font-semibold">This view could not open</h1>
          <p className="mt-2">
            Your saved selections remain in the page address. Please try again.
          </p>
          <Button className="mt-4" variant="secondary" onClick={retry}>
            Try again
          </Button>
        </div>
      </section>
    </main>
  );
}

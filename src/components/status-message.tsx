import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { ContentSkeleton } from './ui/skeleton';
export function StatusMessage({
  loading,
  error,
  retry,
  kind = 'summary',
}: {
  loading?: boolean;
  error?: string;
  retry?: () => void;
  kind?: 'summary' | 'history' | 'form' | 'assessment' | 'sources';
}) {
  if (loading) return <ContentSkeleton kind={kind} />;
  if (error)
    return (
      <div className="status-message error" role="alert">
        <AlertCircle size={18} />
        <div>
          <p>{error}</p>
          {retry && (
            <Button variant="secondary" size="small" onClick={retry} className="mt-3">
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  return null;
}

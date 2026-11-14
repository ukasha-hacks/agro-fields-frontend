import { AlertCircle, LoaderCircle } from 'lucide-react';
import { Button } from './ui/button';
export function StatusMessage({
  loading,
  error,
  retry,
}: {
  loading?: boolean;
  error?: string;
  retry?: () => void;
}) {
  if (loading)
    return (
      <div className="status-message" role="status">
        <LoaderCircle className="animate-spin" size={18} />
        <span>Reading the local archive…</span>
      </div>
    );
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

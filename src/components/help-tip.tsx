'use client';
import { CircleHelp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
export function HelpTip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="help-tip" aria-label={`Help: ${label}`}>
          <CircleHelp size={15} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="max-w-72 text-sm leading-relaxed">
        <p className="mb-2 font-semibold">{label}</p>
        <div className="text-muted">{children}</div>
      </PopoverContent>
    </Popover>
  );
}

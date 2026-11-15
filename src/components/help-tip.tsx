'use client';
import { CircleHelp, X } from 'lucide-react';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
export function HelpTip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="help-tip" aria-label={`Help: ${label}`}>
          <CircleHelp size={15} />
        </button>
      </PopoverTrigger>
      <PopoverContent aria-label={label} className="max-w-72 text-sm leading-relaxed">
        <div className="popover-heading">
          <p className="font-semibold">{label}</p>
          <PopoverClose className="popover-dismiss" aria-label="Close help">
            <X size={16} />
          </PopoverClose>
        </div>
        <div className="text-muted">{children}</div>
      </PopoverContent>
    </Popover>
  );
}

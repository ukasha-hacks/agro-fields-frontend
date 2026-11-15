'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from './button';
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  bodyClassName,
  children,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  description: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root modal={false} open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Content
          className="sheet-content"
          aria-describedby="sheet-description"
          onInteractOutside={(event) => event.preventDefault()}
        >
          <div className="sheet-heading">
            <div>
              <p className="eyebrow">Agro Field</p>
              <Dialog.Title className="text-3xl tracking-tight">{title}</Dialog.Title>
              <Dialog.Description id="sheet-description" className="mt-2 text-sm text-muted">
                {description}
              </Dialog.Description>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                This tool supports your decisions. It does not replace your own experience or local
                agricultural advisers.
              </p>
            </div>
            <Dialog.Close asChild>
              <Button variant="secondary" size="icon" aria-label="Close panel">
                <X />
              </Button>
            </Dialog.Close>
          </div>
          <div className={`sheet-body ${bodyClassName ?? ''}`}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

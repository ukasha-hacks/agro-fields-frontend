'use client';
import { useState } from 'react';
import { Check, ChevronDown, MapPin, X } from 'lucide-react';
import type { Location } from '@/lib/api';
import { Button } from './ui/button';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from './ui/popover';
export function LocationPicker({
  locations,
  selected,
  onSelect,
}: {
  locations: Location[];
  selected?: Location;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" className="location-picker">
          <MapPin />
          <span className="flex-1 text-left">{selected?.name ?? 'Choose an area'}</span>
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Choose a sample area" className="location-popover w-72">
        <div className="popover-heading">
          <p className="text-sm font-medium">Choose a sample area</p>
          <PopoverClose className="popover-dismiss" aria-label="Close area list">
            <X size={16} />
          </PopoverClose>
        </div>
        <div className="space-y-1">
          {locations.map((location) => (
            <button
              className="location-option"
              key={location.location_id}
              aria-pressed={selected?.location_id === location.location_id}
              onClick={() => {
                onSelect(location.location_id);
                setOpen(false);
              }}
            >
              <div>
                <span className="block font-medium">{location.name}</span>
                <span className="text-xs text-muted">{location.region} Uganda</span>
              </div>
              {selected?.location_id === location.location_id && <Check size={17} />}
            </button>
          ))}
          {!locations.length && (
            <p className="text-sm text-muted">
              The area list is not available yet. Check the archive message on the map.
            </p>
          )}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          2016–2025 · Sample points, not district averages.
        </p>
      </PopoverContent>
    </Popover>
  );
}

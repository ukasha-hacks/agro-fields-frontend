'use client';
import { useState } from 'react';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import type { Location } from '@/lib/api';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
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
      <PopoverContent className="w-80">
        <p className="mb-3 text-xs text-muted">Four sample areas in Uganda</p>
        <div className="space-y-1">
          {locations.map((location) => (
            <button
              className="location-option"
              key={location.location_id}
              onClick={() => {
                onSelect(location.location_id);
                setOpen(false);
              }}
            >
              <div>
                <span className="block font-medium">{location.name}</span>
                <span className="text-xs text-muted">{location.region} · 2016–2025</span>
              </div>
              {selected?.location_id === location.location_id && <Check size={17} />}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          These are sample points, not district averages.
        </p>
      </PopoverContent>
    </Popover>
  );
}

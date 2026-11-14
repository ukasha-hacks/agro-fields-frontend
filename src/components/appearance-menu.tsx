'use client';
import { Moon, SlidersHorizontal, Sun, Type } from 'lucide-react';
import { useAppearance } from '@/lib/appearance';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
export function AppearanceMenu() {
  const { theme, textSize, setTheme, setTextSize } = useAppearance();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="appearance-toggle"
          aria-label="Appearance and text size"
        >
          <SlidersHorizontal />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <p className="mb-4 font-semibold">Make it comfortable</p>
        <p className="mb-2 text-xs text-muted">Colour</p>
        <div className="segmented mb-5">
          {(['light', 'dark'] as const).map((value) => (
            <button key={value} aria-pressed={theme === value} onClick={() => setTheme(value)}>
              {value === 'light' ? <Sun size={15} /> : <Moon size={15} />}
              {value === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
        <p className="mb-2 text-xs text-muted">Text size</p>
        <div className="segmented">
          {(['small', 'medium', 'large'] as const).map((value) => (
            <button
              key={value}
              aria-pressed={textSize === value}
              onClick={() => setTextSize(value)}
            >
              <Type size={value === 'small' ? 12 : value === 'medium' ? 15 : 18} />
              {value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

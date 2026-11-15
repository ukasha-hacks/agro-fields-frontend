'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LocateFixed, Minus, Plus, X } from 'lucide-react';
import { countryPath, project, clampZoom, mapNeedsReset, type Country } from '@/lib/map-geometry';
import type { Location } from '@/lib/api';
import { Button } from './ui/button';
import { HelpTip } from './help-tip';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from './ui/popover';
import { ContentSkeleton } from './ui/skeleton';

export function UgandaMap({
  locations,
  selected,
  onSelect,
}: {
  locations: Location[];
  selected?: Location;
  onSelect: (id: string) => void;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    originX: number;
    originY: number;
    moved: boolean;
    pointerId: number;
  } | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [view, setView] = useState({ zoom: 1, x: 0, y: 0 });
  const [frame, setFrame] = useState({ x: 0, y: 0, width: 1100, height: 1000 });
  const reset = () => setView({ zoom: 1, x: 0, y: 0 });
  const shapes = useMemo(
    () => countries.map((country) => ({ country, path: countryPath(country) })),
    [countries],
  );
  useEffect(() => {
    let active = true;
    setError(false);
    fetch('/maps/country-context.geojson')
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((j) => {
        if (active) setCountries(j.features);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  function zoomBy(factor: number, px = 550, py = 500) {
    setView((old) => {
      const zoom = clampZoom(old.zoom * factor);
      const ratio = zoom / old.zoom;
      return { zoom, x: px - (px - old.x) * ratio, y: py - (py - old.y) * ratio };
    });
  }
  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const resize = new ResizeObserver(() => {
      const matrix = element.getScreenCTM();
      if (!matrix) return;
      const rect = element.getBoundingClientRect();
      setFrame({
        x: (rect.left - matrix.e) / matrix.a,
        y: (rect.top - matrix.f) / matrix.d,
        width: rect.width / matrix.a,
        height: rect.height / matrix.d,
      });
    });
    resize.observe(element);
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const point = element.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const matrix = element.getScreenCTM();
      if (!matrix) return;
      const local = point.matrixTransform(matrix.inverse());
      zoomBy(Math.exp(-event.deltaY * 0.0015), local.x, local.y);
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      resize.disconnect();
      element.removeEventListener('wheel', onWheel);
    };
  }, []);
  const labels = [
    { name: 'SOUTH SUDAN', lon: 31.8, lat: 4.9 },
    { name: 'KENYA', lon: 35.6, lat: 1.6 },
    { name: 'D. R. CONGO', lon: 28.9, lat: 1.2 },
    { name: 'TANZANIA', lon: 32.5, lat: -1.9 },
    { name: 'RWANDA', lon: 29.7, lat: -1.9 },
  ];
  return (
    <div className="map-stage">
      <svg
        ref={svg}
        viewBox="0 0 1100 1000"
        className="country-map"
        aria-label="Interactive map of Uganda and four sample locations"
        role="group"
        tabIndex={0}
        onKeyDown={(e) => {
          if (['+', '='].includes(e.key)) zoomBy(1.2);
          if (e.key === '-') zoomBy(1 / 1.2);
          if (e.key === '0' || e.key === 'Home') reset();
          const moves: Record<string, [number, number]> = {
            ArrowLeft: [40, 0],
            ArrowRight: [-40, 0],
            ArrowUp: [0, 40],
            ArrowDown: [0, -40],
          };
          if (moves[e.key] && e.target === svg.current) {
            e.preventDefault();
            setView((v) => ({ ...v, x: v.x + moves[e.key][0], y: v.y + moves[e.key][1] }));
          }
        }}
        onPointerDown={(e) => {
          if (!e.isPrimary || e.button !== 0) return;
          if ((e.target as Element).closest('[data-map-marker]')) return;
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            originX: view.x,
            originY: view.y,
            moved: false,
            pointerId: e.pointerId,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const start = drag.current;
          if (!start || start.pointerId !== e.pointerId || !svg.current) return;
          const matrix = svg.current.getScreenCTM();
          if (!matrix) return;
          const dx = (e.clientX - start.x) / matrix.a;
          const dy = (e.clientY - start.y) / matrix.d;
          if (Math.abs(dx) + Math.abs(dy) > 3) start.moved = true;
          // Pointer release may clear the ref before React runs this update.
          const x = start.originX + dx;
          const y = start.originY + dy;
          setView((v) => ({ ...v, x, y }));
        }}
        onPointerUp={(e) => {
          if (drag.current?.pointerId === e.pointerId) drag.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <defs>
          <linearGradient id="uganda-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--map-uganda-light)" />
            <stop offset="100%" stopColor="var(--map-uganda)" />
          </linearGradient>
        </defs>
        <g transform={`translate(${view.x},${view.y}) scale(${view.zoom})`}>
          {shapes
            .filter(({ country }) => country.properties.ISO3CD !== 'UGA')
            .map(({ country, path }) => (
              <path
                key={country.properties.ISO3CD}
                d={path}
                className="neighbor-shape"
                fillRule="evenodd"
              />
            ))}
          {shapes
            .filter(({ country }) => country.properties.ISO3CD === 'UGA')
            .map(({ path }) => (
              <path
                key="UGA"
                d={path}
                className="uganda-shape"
                fill="url(#uganda-fill)"
                fillRule="evenodd"
              />
            ))}
          {labels.map((label) => (
            <text
              key={label.name}
              x={project(label.lon, label.lat)[0]}
              y={project(label.lon, label.lat)[1]}
              textAnchor="middle"
              className="neighbor-label"
            >
              {label.name}
            </text>
          ))}
          <text
            x={project(32.3, 1.6)[0]}
            y={project(32.3, 1.6)[1]}
            textAnchor="middle"
            className="uganda-label"
          >
            UGANDA
          </text>
          {locations.map((location) => {
            const [x, y] = project(location.longitude, location.latitude);
            const active = location.location_id === selected?.location_id;
            return (
              <g
                key={location.location_id}
                transform={`translate(${x},${y}) scale(${1 / view.zoom})`}
                data-map-marker="true"
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <g
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${location.name}`}
                      aria-pressed={active}
                      className={`map-marker ${active ? 'active' : ''}`}
                      onClick={() => onSelect(location.location_id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelect(location.location_id);
                          e.currentTarget.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                        }
                      }}
                    >
                      <circle r={24} fill="transparent" />
                      <circle r={active ? 20 : 13} className="marker-outer" />
                      <circle r={active ? 6 : 4} className="marker-inner" />
                      <text x={27} y={5} className="marker-label">
                        {location.name.replace(' vicinity', '')}
                      </text>
                    </g>
                  </PopoverTrigger>
                  <PopoverContent aria-label={location.name} className="map-popover w-72">
                    <div className="popover-heading">
                      <p className="font-medium">{location.name}</p>
                      <PopoverClose className="popover-dismiss" aria-label="Close area information">
                        <X size={16} />
                      </PopoverClose>
                    </div>
                    <p className="text-sm text-muted">{location.region} Uganda · Sample point</p>
                    <p className="mt-2 text-xs text-muted">
                      Past records, 2016–2025. Your field may differ.
                    </p>
                  </PopoverContent>
                </Popover>
              </g>
            );
          })}
        </g>
      </svg>
      {!countries.length && !error && (
        <div className="map-loading">
          <ContentSkeleton kind="map" label="Loading the map outline" />
        </div>
      )}
      {error && (
        <div className="map-error" role="alert">
          <p>The map outline could not load. You can still choose an area from the list.</p>
          <Button
            variant="secondary"
            size="small"
            className="mt-3"
            onClick={() => setRetry((value) => value + 1)}
          >
            Retry map
          </Button>
        </div>
      )}
      <div className="map-controls">
        <div className="zoom-group">
          <Button variant="ghost" size="icon" aria-label="Zoom in" onClick={() => zoomBy(1.25)}>
            <Plus />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Zoom out" onClick={() => zoomBy(0.8)}>
            <Minus />
          </Button>
        </div>
        {mapNeedsReset(view, frame) && (
          <Button
            variant="secondary"
            className="reset-map"
            onClick={reset}
            aria-label="Reset map"
            title="Bring Uganda back into view"
          >
            <LocateFixed />
            <span>Reset map</span>
          </Button>
        )}
        <HelpTip label="Move around the map">
          Scroll to zoom. Drag to move. Use Reset map to bring Uganda back. Keyboard: +, −, arrow
          keys, and Home.
        </HelpTip>
      </div>
    </div>
  );
}

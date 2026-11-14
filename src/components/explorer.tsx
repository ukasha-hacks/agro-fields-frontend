'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useQueryStates } from 'nuqs';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Leaf,
  MapPin,
  Menu,
  MoveUpRight,
  Sprout,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { type Location, type ExploreResponse } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { urlParsers, toExplore } from '@/lib/url-state';
import { exploreSchema } from '@/lib/validation';
import { formatValue } from '@/lib/utils';
import { UgandaMap } from './uganda-map';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Sheet } from './ui/sheet';
import { LocationPicker } from './location-picker';
import { AppearanceMenu } from './appearance-menu';
import { HelpTip } from './help-tip';
import { HistoryPanel } from './history-panel';
import { StatusMessage } from './status-message';

export function Explorer() {
  const [state, setState] = useQueryStates(urlParsers, { history: 'replace', shallow: true });
  const query = useSearchParams().toString();
  const infoLink = (path: string) => (query ? `${path}?${query}` : path);
  const catalog = useApi<Location[]>('locations');
  const locations = catalog.data ?? [];
  const selected = locations.find((l) => l.location_id === state.area);
  const request = toExplore(state);
  const valid = exploreSchema.safeParse(request);
  const history = useApi<ExploreResponse>('explore', request, !!selected && valid.success);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopyError('Copy the address from your browser to share this view.');
    }
  }
  const open = (view: 'history' | 'farm' | 'results') => {
    void setState({ view }, { history: 'push' });
  };
  const label =
    state.view === 'history'
      ? 'Explore the seasons'
      : state.view === 'farm'
        ? 'Your farm, your priorities'
        : 'Your rotation assessment';
  const rain = history.data?.statistics.find((s) => s.metric_id === 'rainfall_total_mm');
  const temperature = history.data?.statistics.find((s) => s.metric_id === 'temperature_mean_c');
  const wetness = history.data?.statistics.find((s) => s.metric_id === 'surface_soil_wetness_mean');
  return (
    <main className="explorer-shell">
      <a href="#area-card" className="skip-link">
        Skip to area details
      </a>
      <UgandaMap
        locations={locations}
        selected={selected}
        onSelect={(area) => {
          void setState({ area, cursor: -1, details: true }, { history: 'push' });
        }}
      />
      <div className="map-search">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <p className="mb-1 text-base font-semibold tracking-tight">Agro Field</p>
            <p className="mb-4 text-xs text-muted">Past seasons. Useful questions.</p>
            <Link className="menu-link" href={infoLink('/how-it-works')}>
              How it works
              <ArrowRight size={15} />
            </Link>
            <Link className="menu-link" href={infoLink('/faq')}>
              Common questions
              <ArrowRight size={15} />
            </Link>
            <Link className="menu-link" href={infoLink('/sources')}>
              Data and sources
              <ArrowRight size={15} />
            </Link>
          </PopoverContent>
        </Popover>
        <LocationPicker
          locations={locations}
          selected={selected}
          onSelect={(area) => {
            void setState({ area, cursor: -1, details: true }, { history: 'push' });
          }}
        />
        <Link href="/" aria-label="Agro Field home" className="search-brand">
          <Sprout size={21} />
        </Link>
      </div>
      <div className="appearance-position">
        <AppearanceMenu />
      </div>
      <motion.aside
        hidden={!state.details}
        className="area-card"
        id="area-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Selected sample area</p>
            <h1 className="mt-2 text-2xl tracking-tight">{selected?.name ?? 'Choose an area'}</h1>
          </div>
          <Button
            variant="ghost"
            size="small"
            aria-label="Hide area details"
            onClick={() => {
              void setState({ details: false });
            }}
          >
            <X size={16} />
          </Button>
        </div>
        <StatusMessage loading={catalog.loading} error={catalog.error} retry={catalog.refetch} />
        {locations.length > 0 && (
          <>
            {!selected && (
              <p className="field-error" role="alert">
                This area is not in the local archive. Please choose an area from the list.
              </p>
            )}
            {selected && (
              <>
                <div className="area-context">
                  <MapPin size={14} />
                  <span>{selected.region} Uganda</span>
                  <span className="ml-auto">Sample point</span>
                </div>
                {!valid.success && (
                  <div className="mt-4">
                    <p className="field-error">Your saved dates or topics need a quick check.</p>
                    <Button
                      variant="secondary"
                      size="small"
                      className="mt-2"
                      onClick={() => open('history')}
                    >
                      Review selection
                    </Button>
                  </div>
                )}
                <StatusMessage
                  loading={history.loading}
                  error={history.error}
                  retry={history.refetch}
                />
                {history.data && (
                  <div className="area-stats">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted">Selected period</p>
                      <HelpTip label="Selected period">
                        These summaries use the dates in your link. Open Explore history to change
                        the dates or topics.
                      </HelpTip>
                      <span className="ml-auto text-xs">
                        {state.from.slice(0, 4) === state.to.slice(0, 4)
                          ? state.from.slice(0, 4)
                          : `${state.from.slice(0, 4)}–${state.to.slice(0, 4)}`}
                      </span>
                    </div>
                    <div className="quick-metrics">
                      {rain && (
                        <div>
                          <p>Rainfall</p>
                          <strong>
                            {formatValue(rain.value)}
                            <small>mm</small>
                          </strong>
                        </div>
                      )}
                      {temperature && (
                        <div>
                          <p>Temperature</p>
                          <strong>
                            {formatValue(temperature.value)}
                            <small>°C</small>
                          </strong>
                        </div>
                      )}
                      {wetness && (
                        <div>
                          <p>
                            Wetness
                            <HelpTip label="Soil wetness">
                              A modelled index from 0 to 1. A higher value means wetter conditions.
                              It does not measure nutrients or soil fertility.
                            </HelpTip>
                          </p>
                          <strong>
                            {formatValue(wetness.value, 2)}
                            <small>/ 1</small>
                          </strong>
                        </div>
                      )}
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-muted">
                      Historical context for this sample point.
                      <br />
                      Your field may differ.
                    </p>
                  </div>
                )}
                <Button className="mt-5 w-full justify-between" onClick={() => open('history')}>
                  Explore history
                  <ArrowRight />
                </Button>
                <Button
                  variant="ghost"
                  className="mt-1 w-full justify-between"
                  onClick={() => open('farm')}
                >
                  <span className="flex items-center gap-2">
                    <Leaf size={15} />
                    Think about your rotation
                  </span>
                  <ChevronRight />
                </Button>
              </>
            )}
          </>
        )}
        <div className="card-footnote">
          <span>NASA + FAO sources</span>
          <button
            onClick={copyLink}
            className="flex items-center gap-1"
            aria-label="Copy this view link"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Share view'}
          </button>
        </div>
        {copyError && (
          <p className="mt-2 text-xs text-muted" role="status">
            {copyError}
          </p>
        )}
      </motion.aside>
      {!state.details && (
        <Button
          variant="secondary"
          className="show-details"
          onClick={() => {
            void setState({ details: true });
          }}
        >
          <MapPin size={16} />
          Area details
        </Button>
      )}
      <div className="map-footer">
        <span>Context map · FAO GAEZ</span>
        <Link href={infoLink('/sources')} className="flex items-center gap-1">
          Read the sources
          <MoveUpRight size={12} />
        </Link>
      </div>
      <Sheet
        open={state.view !== 'map'}
        onOpenChange={(value) => {
          if (!value) void setState({ view: 'map' });
        }}
        title={label}
        description={`${selected?.name ?? 'Choose an area'} · Historical archive, 2016–2025`}
      >
        {state.view === 'history' ? (
          <HistoryPanel locations={locations} />
        ) : (
          <div className="insight-block"><p>The farmer form and assessment are available on stage/03-farmer-workflow.</p><Button variant="secondary" onClick={() => open('history')}>Explore history</Button></div>
        )}
      </Sheet>
    </main>
  );
}

'use client';
import { useApi } from '@/lib/use-api';
import type { Metadata, MapLayer } from '@/lib/api';
import { StatusMessage } from './status-message';
import { HelpTip } from './help-tip';
export function SourceContent() {
  const metadata = useApi<Metadata>('metadata');
  const maps = useApi<MapLayer[]>('map-layers');
  return (
    <div className="space-y-8">
      <section>
        <h2>The source trail</h2>
        <p>
          The project starts from the{' '}
          <a
            href="https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/?tab=resources"
            target="_blank"
            rel="noreferrer"
          >
            Field Shift challenge resource list ↗
          </a>
          . Environmental and crop files are downloaded once and read locally by the backend. No
          unrelated weather, soil, market or yield dataset is added.
        </p>
        <p>
          The backend source guide records the supplied resource text because the live challenge
          page could not be retrieved during its preparation. The map outline was found through the
          listed FAO GAEZ portal.
        </p>
      </section>
      <section>
        <h2>Used here, or explained only?</h2>
        <p>
          The working graphs use GPM IMERG rainfall and NASA POWER / MERRA-2 temperature and
          wetness. SMAP and MODIS/Landsat NDVI are not in the local archive. Wetness is not being
          relabelled as SMAP, and the GAEZ outline is map context only.
        </p>
        <p>
          <a href="/methodology">Read the years, source scales and calculation methods.</a>
        </p>
      </section>
      <StatusMessage
        loading={metadata.loading}
        error={metadata.error}
        retry={metadata.refetch}
        kind="sources"
      />
      {metadata.data && (
        <section>
          <h2>Data behind this view</h2>
          <div className="source-cards">
            {metadata.data.sources.map((source) => (
              <article key={source.source_id}>
                <p className="eyebrow">{source.period}</p>
                <h3>{source.name}</h3>
                <p>{source.limitations}</p>
                <a href={source.url} target="_blank" rel="noreferrer">
                  Visit source ↗
                </a>
              </article>
            ))}
          </div>
          <p className="text-xs text-muted">
            Data version {metadata.data.data_version} · Method {metadata.data.methods_version}
          </p>
        </section>
      )}
      <section>
        <h2>Why these resources?</h2>
        <div className="source-mapping">
          <div>
            <strong>NASA POWER</strong>
            <p>Past air temperature and modelled wetness give context about growing conditions.</p>
          </div>
          <div>
            <strong>GPM IMERG through POWER</strong>
            <p>Rainfall observations help compare water inputs across selected periods.</p>
          </div>
          <div>
            <strong>FAO GAEZ / ECOCROP</strong>
            <p>
              Crop reference ranges, downloaded HWSD sample-area soil estimates and the maize
              soil/terrain map provide broad context. They do not validate a local rotation.
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2>
          A context map, with a clear purpose
          <HelpTip label="Country outline">
            The outline comes from the GAEZ Country Status layer in a GAEZ Country Profile map. It
            is simplified for display. It is not a field boundary or a weather map.
          </HelpTip>
        </h2>
        <p>
          Uganda is highlighted; neighbouring countries stay grey. Only the four backend sample
          points can be selected. The shape comes from the{' '}
          <a
            href="https://www.arcgis.com/home/item.html?id=af5a56e3092242cfa543faab7e3f5ed9"
            target="_blank"
            rel="noreferrer"
          >
            FAO GAEZ Country Profile map ↗
          </a>
          . Zooming changes the view, not the source data resolution.
        </p>
      </section>
      {maps.data?.map((layer) => (
        <section key={layer.layer_id}>
          <h2>Maize soil and terrain reference</h2>
          <p>
            {layer.management} · {layer.water_supply} · {layer.baseline}
          </p>
          {layer.preview_url && (
            <img
              className="reference-preview"
              loading="lazy"
              src={`/api/backend/${layer.preview_url.replace('/api/v1/', '')}`}
              alt="Static GAEZ map of maize soil and terrain suitability, with the four sample locations labelled"
            />
          )}
          <p className="text-xs text-muted">{layer.limitations}</p>
          <p className="text-xs text-muted">
            Source: {layer.source.name}. {layer.source.license}
          </p>
        </section>
      ))}
      <section className="info-callout">
        <h2>Evidence supports the conversation</h2>
        <p>
          The prototype does not measure field-level impact or promise yield, income or soil
          improvement. Your crop history, local soil information and advice from agricultural
          experts remain part of the decision.
        </p>
      </section>
    </div>
  );
}

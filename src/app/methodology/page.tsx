import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';
export const metadata: Metadata = { title: 'How we read the data — Agro Field' };
export default function Methodology() {
  return (
    <InfoPage
      label="Methods and limits"
      title="How we read the data"
      intro="A record of what the prototype uses, what each value means and which questions still need local evidence."
    >
      <section>
        <h2>Four points, one shared period</h2>
        <p>
          The archive covers 1 January 2016 to 31 December 2025 at sample points near Gulu, Mbale,
          Masaka and Mbarara. One point in each broad region gives the prototype geographic spread
          while keeping the local download small. This choice does not make the points
          representative of every farm or district.
        </p>
        <p>
          The downloaded files contain region names and country outlines. They do not contain
          Uganda’s regional boundary polygons. We group the area list by region and keep map
          dividers absent until an allowed, verified boundary source is available.
        </p>
      </section>
      <section>
        <h2>Datasets used in the working views</h2>
        <div className="data-table-wrap method-table">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Source</th>
                <th scope="col">What it shows</th>
                <th scope="col">Scale and limits</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">GPM IMERG through NASA POWER</th>
                <td>Past rainfall estimates, downloaded as daily records.</td>
                <td>
                  IMERG’s source grid is 0.1°. These are point samples delivered by POWER, not a
                  rainfall measurement on a field.
                </td>
              </tr>
              <tr>
                <th scope="row">NASA POWER / MERRA-2</th>
                <td>Daily air temperature and modelled surface and root-zone wetness.</td>
                <td>
                  MERRA-2 uses a 0.5° latitude by 0.625° longitude grid. Wetness is a 0–1 index. It
                  is not soil fertility or a soil test.
                </td>
              </tr>
              <tr>
                <th scope="row">FAO GAEZ v4 maize reference</th>
                <td>
                  A static soil and terrain suitability reference for rain-fed maize with low
                  inputs.
                </td>
                <td>
                  2010 land-resource baseline, 30 arc-seconds, roughly 1 km at the equator. It does
                  not establish a present-day rotation.
                </td>
              </tr>
              <tr>
                <th scope="row">GAEZ-linked ECOCROP</th>
                <td>
                  Species ranges for food and cash crops, including coffee, sugarcane, vanilla and
                  cotton.
                </td>
                <td>
                  Species reference ranges. Local crop varieties and seasonal requirements still
                  need validation.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The background country shapes come from the GAEZ Country Status layer. Zooming the map
          does not increase source resolution.{' '}
          <Link href="/sources">Open the full source trail.</Link>
        </p>
        <p>
          <a href="https://power.larc.nasa.gov/docs/methodology/" target="_blank" rel="noreferrer">
            NASA POWER methodology
          </a>{' '}
          explains the source grids. The local download metadata and version remain the record for
          this prototype.
        </p>
      </section>
      <section>
        <h2>How daily records become graphs</h2>
        <p>
          Dates include both the start and end day, in UTC. A monthly rainfall point adds the daily
          rainfall depths you selected in that month. A temperature or wetness point averages the
          selected daily values. Temperature low and high statistics use the daily minimum and
          maximum records.
        </p>
        <p>
          A partial month uses only its selected days and carries a partial-month label. A graph
          point stays empty if any expected daily value is missing. Zero remains zero.
          Selected-period statistics also stay empty if any selected day is missing for that
          measure. Available-day counts explain the coverage.
        </p>
        <p>
          Surface and root-zone wetness keep their 0–1 scale. We do not convert the index into a
          percentage of soil water. The earliest date is shown when a lowest or highest value
          repeats.
        </p>
      </section>
      <section>
        <h2>How the seasonal history is calculated</h2>
        <p>
          The optional seasonal section fetches monthly values for the full 2016–2025 archive
          through the existing local API. For each calendar month, it averages that month’s complete
          values across available years. It shows the number of complete years beside each value.
        </p>
        <p>
          For March–May and September–November, we total rainfall in the three complete calendar
          months for each year. We then calculate the mean of those yearly totals and count how many
          fall below it. A year with a missing month is excluded. The year-by-year totals remain
          visible for checking.
        </p>
        <p>
          These windows are calendar comparisons. We do not assign one planting calendar to all of
          Uganda or label below-average rain as drought. Bare-field dates and crop stress need field
          observations, crop calendars and reviewed thresholds.
        </p>
      </section>
      <section>
        <h2>What comes from the farmer</h2>
        <p>
          Past crops, water supply, priorities, soil results and planned dates are farmer answers.
          We keep them separate from NASA-derived records. Unknown values stay unknown. The three
          planned seasons describe the farmer’s starting rotation.
        </p>
        <p>
          The current rule set still awaits agricultural review. Reference-based options compare the
          saved species pH ranges, minimum cycle lengths and historical temperature mean. Any
          missing temperature day leaves that mean unknown. When a measured pH is absent and the
          option is enabled, the tool uses a clearly labelled HWSD sample-area estimate. Crop order
          and future growing conditions are not validated by these checks. We cannot give a
          defensible confidence percentage, priority ranking, income estimate or water-saving figure
          from this evidence.
        </p>
        <p>
          Only downloaded local files are used. Options favor your preferred crops and distinct crop
          combinations; this is a display order, not an agronomic ranking. Long-lived crops such as
          coffee, banana, sugarcane and vanilla have saved references but are not generated as
          seasonal replacements. Annual rainfall ranges are not treated as seasonal water needs.
          Missing evidence may leave fewer than two options.
        </p>
      </section>
      <section className="info-callout">
        <h2>Products not used here</h2>
        <p>
          SMAP, MODIS/Landsat NDVI, ECOSTRESS and evapotranspiration layers are not part of the
          working archive. The explainer page describes some of these terms for learning. It does
          not imply those measurements are in the app. There are no placeholder weather values in
          the normal analysis.
        </p>
      </section>
    </InfoPage>
  );
}

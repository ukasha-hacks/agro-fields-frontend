import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';
import { LearnTerms } from '@/components/learn-terms';
export const metadata: Metadata = { title: 'How it works — Agro Field' };
const steps = [
  {
    number: '01',
    title: 'Choose a sample area',
    text: 'Pick Gulu, Mbale, Masaka or Mbarara on the map or in the area list. These are four sample points. The data is not an average for the whole district.',
  },
  {
    number: '02',
    title: 'Look back at the seasons',
    text: 'Choose dates from 2016 to 2025. Explore rainfall, air temperature and modelled soil wetness. Use a line or bar graph. Move the replay slider to read one past period at a time.',
  },
  {
    number: '03',
    title: 'Bring your farm knowledge',
    text: 'Add past crops, water availability and your main priority. Enter your next three seasons. Soil test values and planting dates are optional. Not sure is always better than a guess.',
  },
  {
    number: '04',
    title: 'Read the checks, ask the next question',
    text: 'Your starting plan stays visible. Alternatives need supporting evidence. At present, reviewed local rotation rules are still missing, so the tool explains those gaps. Take the report to a local farming expert.',
  },
];
export default function HowItWorks() {
  return (
    <InfoPage
      label="A simple guide"
      title={'A little history.\nA more informed next step.'}
      intro="Start with evidence from the past, then add the knowledge only you have about your farm."
    >
      <div className="guide-steps">
        {steps.map((step) => (
          <section key={step.number}>
            <span>{step.number}</span>
            <div>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
            </div>
          </section>
        ))}
      </div>
      <section className="info-callout">
        <h2>Keep a view, share a conversation</h2>
        <p>
          Your area, dates, graph style and valid farm answers are kept in the URL. Copy the address
          to return to the same view. Shared links contain your answers. Download a PDF when you
          need a simple record of the results and sources.
        </p>
      </section>
      <section>
        <h2>Try a short walkthrough</h2>
        <p>
          Choose Mbale in the area list, then select Explore history. Keep 1 January to 31 December
          2024 and choose rainfall. The total is 1,984.87 mm for 366 available days. The summary may
          round the display. Open View values under the graph to check individual months.
        </p>
        <p>
          Choose soil wetness to see separate surface and root-zone values. Average means the mean
          over your selected days. Lowest and highest show daily extremes and their dates. A value
          of 0.518 / 1 is a model index, not 51.8% water in your soil.
        </p>
        <p>
          Open Seasonal history to compare the same sample across all ten archive years. Its
          calendar windows use the full archive even if your main graphs show one year. Use the
          year-by-year list to check the rainfall comparison.
        </p>
        <p>
          Use the lime sprout button beside the area picker to open Plan rotation. Enter past crops
          in order, then water supply and one main priority. Add three planned seasons. Choose Not
          sure for unknown crops, or Fallow when you left the field without a crop. Optional soil
          values should come from a test or a known measurement.
        </p>
        <p>
          Review your answers before opening the assessment. Follow an Open evidence button to
          return to the matching graph. An unfilled option means more supporting evidence is needed.
          It is not a failed farm or a poor crop choice.
        </p>
      </section>
      <section>
        <h2>Why these four sample areas?</h2>
        <p>
          Masaka, Mbale, Gulu and Mbarara give the small prototype a point in each broad region of
          Uganda. All four have the same downloaded ten-year period, which makes the demonstration
          consistent and manageable. They do not represent all soils, farms or rainfall patterns in
          their regions.
        </p>
      </section>
      <section>
        <h2>Small controls, useful explanations</h2>
        <p>
          Scroll over the map to zoom. Drag to move it. Reset map appears when the map centre has
          moved by at least a quarter of the visible width or height. It brings Uganda back into
          view. Keyboard users can use +, −, arrow keys and Home. Use the appearance button to
          choose light or dark and adjust text size. Help icons explain unfamiliar terms.
        </p>
        <p>
          Graphs include a values table. Missing data is shown as empty, rather than zero.
          Reduced-motion settings stop automatic replay, while the slider remains available.
        </p>
      </section>
      <LearnTerms />
      <section>
        <h2>If something does not load</h2>
        <p>
          A skeleton shows that content is loading. If the archive cannot be reached, read the error
          message and use Try again. The map outline can fail separately from the archive. You can
          still choose a sample from the list when the outline fails.
        </p>
        <p>
          The app reads downloaded files, but your browser still needs the running frontend and
          backend. A missing value stays empty. It is not replaced with an invented value.
        </p>
        <p>
          <Link href="/methodology">Read the data methods, source scales and limits.</Link>
        </p>
      </section>
      <Link className="text-link" href="/faq">
        Still have a question? Read the FAQ ↗
      </Link>
    </InfoPage>
  );
}

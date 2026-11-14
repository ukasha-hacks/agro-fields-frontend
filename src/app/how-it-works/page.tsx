import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';
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
        <h2>Small controls, useful explanations</h2>
        <p>
          Scroll over the map to zoom. Drag to move it. Reset map brings Uganda back into view.
          Keyboard users can use +, −, arrow keys and Home. Use the appearance button to choose
          light or dark and adjust text size. Help icons explain unfamiliar terms.
        </p>
        <p>
          Graphs include a values table. Missing data is shown as empty, rather than zero.
          Reduced-motion settings stop automatic replay, while the slider remains available.
        </p>
      </section>
      <Link className="text-link" href="/faq">
        Still have a question? Read the FAQ ↗
      </Link>
    </InfoPage>
  );
}

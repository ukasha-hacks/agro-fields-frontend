import type { Metadata } from 'next';
import { InfoPage } from '@/components/info-page';
export const metadata: Metadata = { title: 'Common questions — Agro Field' };
const questions = [
  [
    'Is this a weather forecast?',
    'No. The archive covers 2016–2025. It helps you understand past conditions. It does not show current weather or predict the next season.',
  ],
  [
    'Does a map point represent my whole district?',
    'No. Each point uses a source grid cell near the named place. Farms in the same area can have different rainfall, soil and water conditions. The country outline is only map context.',
  ],
  [
    'What does soil wetness mean?',
    'It is a modelled index from 0 to 1. A higher number means wetter conditions in the model. It does not tell you soil nutrients, pH, organic carbon or soil fertility.',
  ],
  [
    'What is crop history?',
    'The crops you grew in earlier seasons, in order. For example: maize, then beans, then maize. Select several crops when they grew together. Fallow means no crop was grown. Choose Not sure if you cannot remember.',
  ],
  [
    'Why are there no recommended alternatives yet?',
    'Reviewed local rotation rules are still missing. The app can show reference-based ideas from the saved crop ranges, with the checks and gaps. They do not confirm crop order, seasonal water needs or benefits. A missing crop reference can prevent alternatives.',
  ],
  [
    'Can I enter soil test results?',
    'Yes. Soil pH, soil texture and organic carbon are optional. Use measured values you know. Leave them blank when unsure. The tool cannot infer them from the wetness graph.',
  ],
  [
    'Why can a graph have an empty point?',
    'The source may be missing an observation. A monthly point stays empty if any selected day is missing for that series. Real zero rainfall is kept as zero. Partial months use only the days you selected.',
  ],
  [
    'Why are topics shown on separate graphs?',
    'Rainfall, temperature and wetness use different units. Separate graphs keep the scale clear. Surface and root-zone wetness can share a graph because both use a 0–1 index.',
  ],
  [
    'Are my answers saved?',
    'Valid answers are saved in your URL. Reopening that address restores the form. Invalid entries must be fixed before they can be saved. Only appearance is kept in browser storage. Shared links include the form answers.',
  ],
  [
    'Does the app need live satellite downloads?',
    'No. Normal use reads the downloaded data on the backend. The map outline and fonts are also shipped with the frontend. Your browser still needs access to the running frontend and backend.',
  ],
];
export default function Faq() {
  return (
    <InfoPage
      label="Common questions"
      title={'Clear answers.\nNo extra jargon.'}
      intro="A few things worth knowing before you use the map, graphs or rotation checks."
    >
      <div className="faq-list">
        {questions.map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}

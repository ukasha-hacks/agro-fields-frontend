const nasaVegetation =
  'https://science.nasa.gov/earth/earth-observatory/measuring-vegetation-ndvi-evi/';
const nasaMethod = 'https://power.larc.nasa.gov/docs/methodology/';
const faoSoil = 'https://www.fao.org/4/a0100e/a0100e07.htm';
const terms = [
  {
    title: 'NDVI: how green vegetation looks',
    text: 'NDVI compares red and near-infrared light reflected from land. It helps describe green vegetation. A change can have several causes, so it does not identify a crop problem on its own.',
    status: 'Explainer only. This prototype has no MODIS or Landsat NDVI series.',
    source: nasaVegetation,
  },
  {
    title: 'Evapotranspiration: water leaving soil and plants',
    text: 'Water leaves the land through evaporation and through plant leaves. Together these processes are called evapotranspiration. Rainfall alone cannot tell us a crop’s full water balance.',
    status:
      'Explainer only. The prototype does not calculate evapotranspiration or irrigation demand.',
    source: 'https://viirsland.gsfc.nasa.gov/Products/NASA/ET_ESDR.html',
  },
  {
    title: 'Soil moisture anomaly: a difference from the usual level',
    text: 'An anomaly compares a wetness value with an average for the same time of year over a stated reference period. The reference period and method matter.',
    status:
      'The graphs show modelled wetness levels. They do not calculate a soil moisture anomaly.',
    source: nasaMethod,
  },
  {
    title: 'Heat and frost risk: temperature needs crop context',
    text: 'A temperature that harms one crop or growth stage may not harm another. Duration, local conditions and the crop variety also matter. A past daily low or high alone cannot establish damage.',
    status:
      'Daily temperature values are available. Reviewed crop-stage risk thresholds and field observations are missing.',
    source: nasaMethod,
  },
  {
    title: 'Nitrogen-fixing crops',
    text: 'Legumes can work with bacteria around their roots to take nitrogen from the air. The benefit to the next crop depends on conditions and how much plant material stays in the field.',
    status:
      'A general farming principle. The tool does not estimate nitrogen added by a particular rotation.',
    source: faoSoil,
  },
  {
    title: 'Cover crops',
    text: 'Crops grown to cover the soil can reduce exposure to rain and wind and add plant material. They also use water, seed and labour, so local timing matters.',
    status:
      'Local species, water availability and planting dates need review before choosing a cover crop.',
    source: faoSoil,
  },
  {
    title: 'Deep-rooted crops',
    text: 'Some roots reach deeper soil layers and can help create channels or cycle nutrients. The effect depends on the crop, soil and water conditions.',
    status: 'Rooting depth and soil improvement are not measured by this prototype.',
    source: faoSoil,
  },
];
export function LearnTerms() {
  return (
    <section>
      <h2>Terms you may meet</h2>
      <p>Open a term for a short explanation and what it means in this prototype.</p>
      <div className="faq-list mt-5">
        {terms.map((term) => (
          <details key={term.title}>
            <summary>
              {term.title}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{term.text}</p>
            <p className="term-status">{term.status}</p>
            <a className="text-xs underline" href={term.source} target="_blank" rel="noreferrer">
              Read the source explanation
            </a>
          </details>
        ))}
      </div>
    </section>
  );
}

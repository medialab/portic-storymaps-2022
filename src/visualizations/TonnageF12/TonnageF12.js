import { useState, useMemo } from "react";
import BarChart from "../../components/BarChart";
import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';
import './TonnageF12.scss';
import Measure from "react-measure";
import { max } from "d3-array";

const TonnageF12 = ({
  data,
  width,
  height,
  lang,
  atlasMode,
}) => {
  const [withLest, setWithLest] = useState(true);
  const [dimensionsTitle1, setDimensionsTitle1] = useState({ width: 0, height: 0 });
  const [dimensionsTitle2, setDimensionsTitle2] = useState({ width: 0, height: 0 });
  const [dimensionsButtons, setDimensionsButtons] = useState({ width: 0, height: 0 });

  const vizHeight = useMemo(() => {
    return height - max([dimensionsTitle1.height, dimensionsTitle2.height]) - dimensionsButtons.height - 50;
  }, [height, dimensionsTitle1, dimensionsTitle2, dimensionsButtons]);
  const field = withLest ? 'tonnage_hypothese_avec_lest' : 'tonnage_hypothese_sans_lest';
  const actualData = useMemo(() => {
    const original = data.get('tonnages_f12_1787.csv')
    const aggregated = data.get('tonnages_f12_1787_aggregated_by_grouping.csv')
    const sorted = [original, aggregated].map(dataset => dataset.sort((a, b) => {
      if (a['destination'] > b['destination']) {
        return 1;
      }
      return -1;
    })
      // .filter(a => +a['tonnage_hypothese_avec_lest'] > 0)
      .map(a => ({ ...a, [field]: +a[field] }))
    );
    return {
      original: sorted[0],
      aggregated: sorted[1]
    }
  }
    , [data, field])
  return (
    <div className="TonnageF12">
      <div className="columns-container">
        <div className="column">
          <Measure
            bounds
            onResize={contentRect => {
              setDimensionsTitle1(contentRect.bounds)
            }}
          >
            {({ measureRef }) => (
              <h2 ref={measureRef}>{translate('TonnagesF12', 'title_left', lang)}</h2>

            )}
          </Measure>

          <BarChart
            {...{
              data: actualData.original,
              width: width / 2,
              height: vizHeight, // height - 50,
            }}
            fitHeight={!atlasMode}

            layout='stack'
            orientation='vertical'
            x={{
              field: field,
              domain: [0, 120000],
              tickFormat: d => `${formatNumber(d, lang)} ${lang === 'fr' ? 'tx' : 'b'}`,
              tickSpan: 20000,
              title: translate('TonnagesF12', 'with_lest_title', lang)
            }}
            y={{
              field: 'destination',
              title: translate('TonnagesF12', 'destination', lang)
            }}

            tooltip={
              (d) => translate('TonnagesF12', 'tooltip', lang, {
                tx: formatNumber(d[field], lang),
                destination: d.destination
              })
            }
          />
        </div>
        <div className="column centered-arrow-container">
          <div className="centered-arrow">
            →
          </div>
        </div>
        <div className="column">
          <Measure
            bounds
            onResize={contentRect => {
              setDimensionsTitle2(contentRect.bounds)
            }}
          >
            {({ measureRef }) => (
              <h2 ref={measureRef}>{translate('TonnagesF12', 'title_right', lang)}</h2>

            )}
          </Measure>
          <BarChart
            {...{
              data: actualData.aggregated,
              width: width / 2,
              height:  vizHeight, // height - 50,
            }}
            fitHeight={!atlasMode}

            layout='stack'
            orientation='vertical'
            x={{
              field: field,
              domain: [0, 270000],
              tickFormat: d => `${formatNumber(d, lang)} ${lang === 'fr' ? 'tx' : 'b'}`,
              tickSpan: 50000,
              title: translate('TonnagesF12', 'with_lest_title', lang)
            }}
            y={{
              field: 'destination',
              title: translate('TonnagesF12', 'destination', lang)
            }}

            tooltip={
              (d) => translate('TonnagesF12', 'tooltip', lang, {
                tx: formatNumber(d[field], lang),
                destination: d.destination
              })
            }
          />
        </div>
      </div>
      <Measure
            bounds
            onResize={contentRect => {
              setDimensionsButtons(contentRect.bounds)
            }}
          >
            {({ measureRef }) => (
              <div className="buttons-container" ref={measureRef}>
              <button className={`Button ${withLest ? 'is-active' : ''}`} onClick={() => setWithLest(true)}>
                {translate('TonnagesF12', 'hyp_with_lest', lang)}
              </button>
              <button className={`Button ${!withLest ? 'is-active' : ''}`} onClick={() => setWithLest(false)}>
                {translate('TonnagesF12', 'hyp_without_lest', lang)}
              </button>
            </div>
            )}
        </Measure>
      
      
    </div>
  )
}

export default TonnageF12;
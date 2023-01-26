import { useState, useMemo } from "react";
import BarChart from "../../components/BarChart";
import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';
import './TonnageF12.scss';

const TonnageF12 = ({
  data,
  width,
  height,
  lang,
}) => {
  const [withLest, setWithLest] = useState(true);
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
          <h2>Partenaires de la source F12</h2>
          <BarChart
            {...{
              data: actualData.original,
              width: width / 2,
              height: height - 50,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              field: field,
              domain: [0, 120000],
              tickFormat: d => `${formatNumber(d)} tx`,
              tickSpan: 20000,
              title: translate('TonnagesF12', 'with_lest_title', lang)
            }}
            y={{
              field: 'destination',
              title: translate('TonnagesF12', 'destination', lang)
            }}

            tooltip={
              // @todo translate
              (d) => `${formatNumber(d[field])} tonneaux envoyé au partenaire ${d.destination} en 1787`
            }
          />
        </div>
        <div className="column centered-arrow-container">
          <div className="centered-arrow">
          →
          </div>
        </div>
        <div className="column">
          <h2>Partenaires F12 alignés sur toflit18 "grouping"</h2>
          <BarChart
            {...{
              data: actualData.aggregated,
              width: width / 2,
              height: height - 50,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              field: field,
              domain: [0, 270000],
              tickFormat: d => `${formatNumber(d)} tx`,
              tickSpan: 50000,
              title: translate('TonnagesF12', 'with_lest_title', lang)
            }}
            y={{
              field: 'destination',
              title: translate('TonnagesF12', 'destination', lang)
            }}

            tooltip={
              // @todo translate
              (d) => `${formatNumber(d[field])} tonneaux envoyé au partenaire ${d.destination} en 1787`
            }
          />
        </div>
      </div>
      <div className="buttons-container">
        <button className={`Button ${withLest ? 'is-active' : ''}`} onClick={() => setWithLest(true)}>
          {translate('TonnagesF12', 'hyp_with_lest', lang)}
        </button>
        <button className={`Button ${!withLest ? 'is-active' : ''}`} onClick={() => setWithLest(false)}>
          {translate('TonnagesF12', 'hyp_without_lest', lang)}
        </button>
      </div>
    </div>
  )
}

export default TonnageF12;
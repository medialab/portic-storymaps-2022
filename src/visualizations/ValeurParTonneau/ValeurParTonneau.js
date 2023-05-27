import { useState, useMemo } from "react";
import BarChart from "../../components/BarChart";
import translate from '../../utils/translate';
import { formatNumber } from "../../utils/misc";
import './ValeurParTonneau.scss';

const ValeurParTonneau = ({
  data,
  width,
  height: inputHeight,
  lang,
}) => {
  const height = inputHeight - 100;
  const [withLest, setWithLest] = useState(true);
  const field = withLest ? 'price_per_barrel' : 'price_per_barrel_without_lest';
  const actualData = useMemo(() => {
    return data.sort((a, b) => {
      if (a['partner'] > b['partner']) {
        return 1;
      }
      return -1;
    })
      // .filter(a => +a['price_per_barrel'] > 0)
      .map(a => ({ ...a, [field]: +a[field] }))
  }
    , [data, field])
  return (
    <div className="ValeurParTonneau">
      <div className="columns-container">
        <div className="column">
          <h2>Exports selon toflit18</h2>
          <BarChart
            {...{
              data: actualData,
              width: width / 3,
              height,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              field: 'sum_exports',
              domain: [0, 110000000],
              tickSpan: 50000000,
              tickFormat: d => `${formatNumber(d)} lt`,
              title: 'somme des exports', // translate('TonnagesF12', 'with_lest_title', lang)
            }}
            y={{
              field: 'partner',
              title: 'partenaire', //  translate('TonnagesF12', 'destination', lang)
            }}
            tooltip={
              (d) => `${formatNumber(parseInt(+d.sum_exports))} lt exportés vers le partenaire ${d.partner}`
            }
          />
        </div>
        <div className="column">
          <h2>Tonnages selon F12</h2>
          <BarChart
            {...{
              data: actualData,
              width: width / 3,
              height,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              field: withLest ? 'sum_tonnage' : 'sum_tonnage_without_lest',
              domain: [0, 400001],
              tickSpan: 200000,
              tickFormat: d => `${formatNumber(d)} tx`,
              title: 'somme des tonnages', // translate('TonnagesF12', 'with_lest_title', lang)
            }}
            y={{
              field: 'partner',
              title: 'partenaire', //  translate('TonnagesF12', 'destination', lang)
            }}
            tooltip={
              (d) => `${formatNumber(d[withLest ? 'sum_tonnage' : 'sum_tonnage_without_lest'])} tonneaux cumulés envoyés vers le partenaire ${d.partner}`
            }
          />
        </div>
        <div className="column">
           <h2>Valeur par tonneau</h2>
          <BarChart
            {...{
              data: actualData,
              width: width / 3,
              height,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              field: field,
              domain: [0, 1001],
              tickSpan: 300,
              tickFormat: d => `${d} lt./t`,
              title: 'prix par tonneau', // translate('TonnagesF12', 'with_lest_title', lang)
            }}
            y={{
              field: 'partner',
              title: 'partenaire', //  translate('TonnagesF12', 'destination', lang)
            }}
            // color={{
            // field: 'tonnage_hypothese_avec_lest',
            // title:  // translate('PecheTypeValue', 'color', lang)
            // }}

            tooltip={
              (d) => `${d[field].toFixed(2)} lt par tonneau pour le partenaire ${d.partner}`
            }
          />
        </div>
      </div>
      <div className="buttons-container" style={{ margin: '1rem' }}>
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

export default ValeurParTonneau;
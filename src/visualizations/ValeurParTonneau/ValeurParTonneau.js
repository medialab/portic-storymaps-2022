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
          <h2>{translate('TonnageF12', 'title1', lang)}</h2>
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
              title: translate('TonnageF12', 'x1', lang), // translate('TonnagesF12', 'with_lest_title', lang)
            }}
            y={{
              field: 'partner',
              title: translate('TonnageF12', 'y1', lang),
            }}
            tooltip={
              (d) => 
                translate('TonnageF12', 'tooltip1', lang, {
                  value: formatNumber(parseInt(+d.sum_exports)),
                  partner: d.partner
                })
            }
          />
        </div>
        <div className="column">
          <h2>{translate('TonnageF12', 'title2', lang)}</h2>
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
              tickFormat: d => `${formatNumber(d)} ${lang === 'fr' ? 'tx' : 'b'}`,
              title: translate('TonnageF12', 'x2', lang), // translate('TonnagesF12', 'with_lest_title', lang)
            }}
            y={{
              field: 'partner',
              title: translate('TonnageF12', 'y2', lang), //  translate('TonnagesF12', 'destination', lang)
            }}
            tooltip={
              (d) => 
                translate('TonnageF12', 'tooltip2', lang, {
                  value: formatNumber(d[withLest ? 'sum_tonnage' : 'sum_tonnage_without_lest']),
                  partner: d.partner
                })
            }
          />
        </div>
        <div className="column">
           <h2>{translate('TonnageF12', 'title3', lang)}</h2>
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
              tickFormat: d => `${d} lt./${lang === 'fr' ? 't' : 'b'}`,
              title: translate('TonnageF12', 'x3', lang), // translate('TonnagesF12', 'with_lest_title', lang)
            }}
            y={{
              field: 'partner',
              title: translate('TonnageF12', 'y3', lang), //  translate('TonnagesF12', 'destination', lang)
            }}
            // color={{
            // field: 'tonnage_hypothese_avec_lest',
            // title:  // translate('PecheTypeValue', 'color', lang)
            // }}

            tooltip={
              (d) => 
                translate('TonnageF12', 'tooltip3', lang, {
                  value: d[field].toFixed(2),
                  partner: d.partner
                })
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
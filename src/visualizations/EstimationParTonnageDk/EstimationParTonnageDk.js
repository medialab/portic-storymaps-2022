import { lt } from "lodash";
import { useState, useMemo } from "react";
import BarChart from "../../components/BarChart";
import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';
import './EstimationParTonnageDk.scss';

const EstimationParTonnageDk = ({
  data,
  width,
  height: inputHeight,
  lang,
}) => {
  const height = inputHeight - 100;
  const [withLest, setWithLest] = useState(true);
  const field = useMemo(() => withLest ? 'estimate' : 'estimate_without_lest', [withLest]);
  const actualData = useMemo(() => {
    return data.sort((a, b) => {
      if (a['partenaire'].toLowerCase().replace('é', 'e') > b['partenaire'].toLowerCase().replace('é', 'e')) {
        return 1;
      }
      return -1;
    })
      .map(a => ({ ...a, [field]: +a[field] }))
  }
    , [data, field])
  const total = useMemo(() => {
    return actualData.reduce((sum, item) => {
      const val = item[field];
      return sum + val;
    }, 0)
  }, [actualData, field])
  return (
    <div className="EstimationParTonnageDk">
      <div className="columns-container">
        <div className="column">
          <h2>Tonnages cumulés</h2>
          <BarChart
            {...{
              data: actualData,
              width: width / 4,
              height,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              field: 'tonnage',
              tickFormat: d => `${formatNumber(d)} tx.`,
              tickSpan: 20000,
              title: 'tonnage', // translate('TonnagesF12', 'with_lest_title', lang)
              domain: [0, 31001]
            }}
            y={{
              field: 'partenaire',
              title: 'partenaire', // translate('TonnagesF12', 'destination', lang)
            }}
            // color={{
            // field: 'tonnage',
            // title:  // translate('PecheTypeValue', 'color', lang)
            // }}

            tooltip={
              (d) => `${formatNumber(parseInt(d.tonnage))} tonneaux cumulés pour ${d.partenaire}`
            }
          />
        </div>
        <div className="column centered-arrow-container">
          <div className="centered-arrow">
          →
          </div>
        </div>
        <div className="column">
          <h2>Prix par tonneau</h2>
          <BarChart
            {...{
              data: actualData,
              width: width / 4,
              height,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              field: withLest ? 'price_per_barrel' : 'price_per_barrel_without_lest',
              tickFormat: d => `${formatNumber(d)} lt./tx`,
              tickSpan : 500,
              title: 'prix par tonneau', // translate('TonnagesF12', 'with_lest_title', lang)
              domain: [0, 1001]
            }}
            y={{
              field: 'partenaire',
              title: 'partenaire', // translate('TonnagesF12', 'destination', lang)
            }}
            // color={{
            // field: 'tonnage',
            // title:  // translate('PecheTypeValue', 'color', lang)
            // }}

            tooltip={
              (d) => `${formatNumber(parseInt(d[withLest ? 'price_per_barrel' : 'price_per_barrel_without_lest']))} lt/tonneau pour ${d.partenaire}`
            }
          />
        </div>
        <div className="column centered-arrow-container">
          <div className="centered-arrow">
          →
          </div>
        </div>
        <div className="column" style={{flex: 2}}>
          <h2>Estimation des exports (total : {formatNumber(parseInt(total))} lt.)</h2>
          <BarChart
            {...{
              data: actualData,
              width: width / 2 - 100,
              height,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              field: field,
              tickFormat: d => `${formatNumber(d)} lt.`,
              tickSpan: 5000000,
              title: 'estimation en livres tournois', // translate('TonnagesF12', 'with_lest_title', lang)
              domain: [0, 15000001]
            }}
            y={{
              field: 'partenaire',
              title: 'partenaire', // translate('TonnagesF12', 'destination', lang)
            }}
            // color={{
            // field: 'tonnage',
            // title:  // translate('PecheTypeValue', 'color', lang)
            // }}

            tooltip={
              (d) => `estimation d'exports pour ${d.partenaire} : ${formatNumber(parseInt(d[field]))} lt. (pour ${formatNumber(parseInt(d.tonnage))} tonneaux cumulés)`
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

export default EstimationParTonnageDk;
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
  const height = inputHeight - 150;
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
          <h2>{translate('EstimationParTonnageDk', 'title1', lang)}</h2>
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
              tickFormat: d => `${formatNumber(d, lang)} ${lang === 'fr' ? 'tx' : 'tx'}.`,
              tickSpan: 2500,
              title: 'tonnage', // translate('TonnagesF12', 'with_lest_title', lang)
              domain: [0, 5001]
            }}
            y={{
              field: lang === 'fr' ? 'partenaire' : 'partenaire_en',
              title: lang === 'fr' ? 'partenaire' : 'partner', // translate('TonnagesF12', 'destination', lang)
            }}

            tooltip={
              (d) => 
                translate('EstimationParTonnageDk', 'tooltip1', lang, {
                  value: formatNumber(parseInt(d.tonnage, lang)),
                  partner: lang === 'fr' ? d.partenaire : d.partenaire_en
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
          <h2>{translate('EstimationParTonnageDk', 'title2', lang)}</h2>
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
              tickFormat: d => `${formatNumber(d, lang)} lt./t`,
              tickSpan : 500,
              title: 'prix par tonneau', // translate('TonnagesF12', 'with_lest_title', lang)
              domain: [0, 1001]
            }}
            y={{
              field: lang === 'fr' ? 'partenaire' : 'partenaire_en',
              title: lang === 'fr' ? 'partenaire' : 'partner', // translate('TonnagesF12', 'destination', lang)
            }}
            // color={{
            // field: 'tonnage',
            // title:  // translate('PecheTypeValue', 'color', lang)
            // }}

            tooltip={
              (d) => 
                translate('EstimationParTonnageDk', 'tooltip2', lang, {
                  value: formatNumber(parseInt(d[withLest ? 'price_per_barrel' : 'price_per_barrel_without_lest'], lang)),
                  partner: lang === 'fr' ? d.partenaire : d.partenaire_en
                })
            }
          />
        </div>
        <div className="column centered-arrow-container">
          <div className="centered-arrow">
          →
          </div>
        </div>
        <div className="column" style={{flex: 2}}>
          <h2>
            {
              translate('EstimationParTonnageDk', 'title3', lang, {
                value: formatNumber(parseInt(total, lang))
              })
            }
          </h2>
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
              tickFormat: d => `${formatNumber(d, lang)} lt.`,
              tickSpan: 1000000,
              domain: [0, 3000001],
              title: 'estimation en livres tournois', // translate('TonnagesF12', 'with_lest_title', lang)
            }}
            y={{
              field: lang === 'fr' ? 'partenaire' : 'partenaire_en',
              title: lang === 'fr' ? 'partenaire' : 'partner', // translate('TonnagesF12', 'destination', lang)
            }}
            // color={{
            // field: 'tonnage',
            // title:  // translate('PecheTypeValue', 'color', lang)
            // }}

            tooltip={
              (d) => 
                translate('EstimationParTonnageDk', 'tooltip3', lang, {
                  value: formatNumber(parseInt(d[field]), lang),
                  partner: lang === 'fr' ? d.partenaire : d.partenaire_en,
                  tonnage: formatNumber(parseInt(d.tonnage), lang)
                })
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

export default EstimationParTonnageDk;
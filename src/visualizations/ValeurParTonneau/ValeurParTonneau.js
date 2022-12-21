import { useState, useMemo } from "react";
import BarChart from "../../components/BarChart";
import translate from '../../utils/translate';

const ValeurParTonneau = ({
  data,
  width,
  height,
  lang,
}) => {
  const [withLest, setWithLest] = useState(true);
  const field = withLest ? 'price_per_barrel' : 'price_per_barrel_without_lest';
  const actualData = useMemo(() => {
    return data.sort((a, b) => {
      if (+a['price_per_barrel'] > +b['price_per_barrel']) {
        return -1;
      }
      return 1;
    })
    .filter(a => +a['price_per_barrel'] > 0)
    .map(a => ({...a, [field]: +a[field]}))
  }
  , [data, field])
  return (
    <>
    <BarChart
            {...{
              data: actualData,
              width,
              height,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              field: field,
              domain: [0, 1200],
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

            // tooltip={
            //   (d) => translate('PecheTypeValue', 'tooltip', lang, {
            //     value: formatNumber(d['value']),
            //     year: d['annee']
            //   })
            // }
          />
      <div className="buttons-container" style={{margin: '1rem'}}>
        <button className={`Button ${withLest ? 'is-active': ''}`} onClick={() => setWithLest(true)}>
          {translate('TonnagesF12', 'hyp_with_lest', lang)}
        </button>
        <button className={`Button ${!withLest ? 'is-active': ''}`} onClick={() => setWithLest(false)}>
          {translate('TonnagesF12', 'hyp_without_lest', lang)}
        </button>
      </div>
    </>
  )
}

export default ValeurParTonneau;
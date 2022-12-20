import { useState, useMemo } from "react";
import BarChart from "../../components/BarChart";
import translate from '../../utils/translate';

const TonnageF12 = ({
  data,
  width,
  height,
  lang,
}) => {
  const [withLest, setWithLest] = useState(true);
  const field = withLest ? 'tonnage_hypothese_avec_lest' : 'tonnage_hypothese_sans_lest';
  const actualData = useMemo(() => {
    return data.sort((a, b) => {
      if (+a['tonnage_hypothese_avec_lest'] > +b['tonnage_hypothese_avec_lest']) {
        return -1;
      }
      return 1;
    })
    .filter(a => +a['tonnage_hypothese_avec_lest'] > 0)
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
              title:  translate('TonnagesF12', 'with_lest_title', lang)
            }}
            y={{
              field: 'destination',
              title: translate('TonnagesF12', 'destination', lang)
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

export default TonnageF12;
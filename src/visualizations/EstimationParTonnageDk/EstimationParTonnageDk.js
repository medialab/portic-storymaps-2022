import { lt } from "lodash";
import { useState, useMemo } from "react";
import BarChart from "../../components/BarChart";
import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';

const EstimationParTonnageDk = ({
  data,
  width,
  height,
  lang,
}) => {
  const [withLest, setWithLest] = useState(true);
  const field = withLest ? 'estimate' : 'estimate_without_lest';
  const actualData = useMemo(() => {
    return data.sort((a, b) => {
      if (a['partenaire'] > b['partenaire']) {
        return -1;
      }
      return 1;
    })
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
              tickFormat: d => `${formatNumber(d)} lt.`,
              title:  'estimation en livres tournois', // translate('TonnagesF12', 'with_lest_title', lang)
              domain: [0, 3500000]
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
              (d) => `estimation d'exports pour ${d.partenaire} : ${formatNumber(d[field])} lt. (pour ${d.tonnage} tonneaux cumulés)`
            }
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

export default EstimationParTonnageDk;
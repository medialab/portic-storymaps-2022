import { lt } from "lodash";
import { useState, useMemo } from "react";
import BarChart from "../../components/BarChart";
import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';
import './ComparaisonProjectionDestinationProduitsColoniauxDk.scss';

const ComparaisonProjectionDestinationProduitsColoniauxDk = ({
  data,
  width,
  height,
  lang,
}) => {
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
  }, [actualData, field]);
  const totalImports = useMemo(() => {
    return actualData.reduce((sum, item) => {
      const val = +item['imports_toflit18'];
      return sum + val;
    }, 0)
  }, [actualData, field]);

  const maxDomain = withLest ?  15000001 : 25000001;
  return (
    <div className="ComparaisonProjectionDestinationProduitsColoniauxDk">
      <div className="columns-container">
        <div className="column">
          <h2>Estimation des exports hors smogglage/pêche (total : {formatNumber(parseInt(total))} lt.)</h2>
          <BarChart
            {...{
              data: actualData,
              width: width / 2,
              height,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              field: field,
              tickFormat: d => `${formatNumber(d)} lt.`,
              tickSpan: 5000000,
              domain: [0, maxDomain],
              title: 'estimation en livres tournois', // translate('TonnagesF12', 'with_lest_title', lang)
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
        <div className="column">
          <h2>Observation des imports pour les partenaires correspondant (total : {formatNumber(totalImports)} lt.)</h2>
          <BarChart
            {...{
              data: actualData,
              width: width / 2,
              height,
            }}

            layout='stack'
            orientation='vertical'
            x={{
              field: 'imports_toflit18',
              tickFormat: d => `${formatNumber(d)} lt.`,
              tickSpan: 5000000,
              domain: [0, maxDomain],
              title: 'imports toflit18', // translate('TonnagesF12', 'with_lest_title', lang)
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
              (d) => `imports du BF de Dunkerque pour ${d.partenaire} : ${formatNumber(parseInt(d.imports_toflit18))} lt.`
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

export default ComparaisonProjectionDestinationProduitsColoniauxDk;
import BarChart from "../../components/BarChart";
import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';

const EstimationImportsExports = ({
  data,
  width,
  height,
  lang,
}) => {
  return (
    <BarChart
    {...{
      data,
      width,
      height,
    }}

    layout='stack'
    orientation='vertical'
    margins={{
      left: 200
    }}
    x={{
      field: 'valeur',
      tickFormat: d => `${formatNumber(d)} lt.`,
      // tickSpan: 5000000,
      // domain: [0, 15000001],
      title: 'valeur', // translate('TonnagesF12', 'with_lest_title', lang)
    }}
    y={{
      field: 'label',
      title: 'métrique', // translate('TonnagesF12', 'destination', lang)
    }}
    color={{
    field: 'type',
    // title:  // translate('PecheTypeValue', 'color', lang)
    }}

    tooltip={
      (d) => `métrique pour ${d.label} : ${formatNumber(parseInt(d.valeur))} lt.`
    }
  />
  )
}

export default EstimationImportsExports;
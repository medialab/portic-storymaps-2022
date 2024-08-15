

import BarChart from "../../components/BarChart";
import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';

const DestinationsDkPrProjection = ({
  data,
  width,
  height,
  lang,
}) => {
  return (
    <BarChart
      {...{
        data: data.sort((a, b) => {
          if (a.destination > b.destination) {
            return 1;
          }
          return -1;
        }),
        width,
        height,
      }}

      layout='stack'
      orientation='vertical'
      x={{
        field: 'tonnage',
        tickFormat: d => `${formatNumber(d, lang)} ${lang === 'fr' ? 'tx' : 'b'}`,
        title: translate('DestinationsDkPrProjection', 'x', lang), // translate('TonnagesF12', 'with_lest_title', lang)
      }}
      y={{
        field: 'destination',
        title: translate('DestinationsDkPrProjection', 'y', lang), // translate('TonnagesF12', 'destination', lang)
      }}

    tooltip={
      (d) => 
        translate('DestinationsDkPrProjection', 'tooltip', lang, {
          tonnage: formatNumber(parseInt(d.tonnage, lang)),
          destination: d.destination
        })
    }
    />

  )
}

export default DestinationsDkPrProjection;
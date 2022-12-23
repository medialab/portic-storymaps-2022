

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
        tickFormat: d => `${formatNumber(d)} tx`,
        title: 'tonnage', // translate('TonnagesF12', 'with_lest_title', lang)
      }}
      y={{
        field: 'destination',
        title: 'destination', // translate('TonnagesF12', 'destination', lang)
      }}
    // color={{
    // field: 'tonnage',
    // title:  // translate('PecheTypeValue', 'color', lang)
    // }}

    tooltip={
      (d) => `${formatNumber(parseInt(d.tonnage))} tonneaux cumulés pour la destination ${d.destination}`
    }
    />

  )
}

export default DestinationsDkPrProjection;


import BarChart from "../../components/BarChart";
import { formatNumber } from "../../utils/misc";
import translate from '../../utils/translate';

const ExportsFr1787 = ({
  data,
  width,
  height,
  lang,
}) => {
  return (
    <BarChart
      {...{
        data: data.sort((a, b) => {
          if (a.partner > b.partner) {
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
        field: 'value',
        tickFormat: d => `${formatNumber(d, lang)} lt.`,
        tickSpan: 10000000,
        domain: [0, 100000000],
        title: 'valeur', // translate('TonnagesF12', 'with_lest_title', lang)
        
      }}
      y={{
        field: lang === 'fr' ? 'partner' : 'partner_en',
        title: 'partenaire', // translate('TonnagesF12', 'destination', lang)
      }}
    // color={{
    // field: 'tonnage',
    // title:  // translate('PecheTypeValue', 'color', lang)
    // }}

    tooltip={
      (d) => translate('ExportsFr1787', 'tooltip', lang, {
        value: formatNumber(parseInt(d.value, lang)),
        partner: lang === 'fr' ? d.partner : d.partner_en
      })
    }
    />

  )
}

export default ExportsFr1787;
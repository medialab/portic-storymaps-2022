import React, { useMemo } from "react"
import colorsPalettes from "../../utils/colorPalettes";

import AlluvialImportExport from "../../components/AlluvialImportExport";
import translate from "../../utils/translate";

const {importsExports: palette} = colorsPalettes;

export default function EstimationExportsDkSnail({
    data: inputData,
    dimensions,
    atlasMode,
    lang,
    ...props
}) {
    /** @type {Object[]} */
    const data = useMemo(function prepareData() {
        let preparedData = inputData
            // .filter(({ port, aggregate_type }) => port === 'Dunkerque' && aggregate_type === 'detail_products')
            .map(({ value, partner_type, product_type, ...rest }) => {
                return {
                  ...rest,
                    value: parseInt(+value), // string to number
                    partner_type: translate('AlluvialImportExport', partner_type, lang),
                    product_type: product_type ? translate('AlluvialImportExport', product_type, lang) : product_type,
                }
            });
        return preparedData;
    }, [inputData]);

    return (
        <AlluvialImportExport
            {...{
                dimensions,
                atlasMode,
                data
            }}
            hideArrows={true}
            lang={lang}
            colorPalette={{
              ...palette,
              'Fraude': 'grey',
              // 'Fraud': 'grey',
              [translate('AlluvialImportExport', 'bureau des fermes de Dunkerque', lang)]: '#082d45',
              '': '#9bb5c6'
            }}
        />
    )
}
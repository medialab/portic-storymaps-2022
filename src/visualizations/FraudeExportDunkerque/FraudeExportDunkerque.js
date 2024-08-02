import React, { useMemo } from "react"
import colorsPalettes from "../../utils/colorPalettes";

import AlluvialImportExport from "../../components/AlluvialImportExport";
import translate from "../../utils/translate";

const {importsExports: palette} = colorsPalettes;

export default function FraudeExportDunkerque({
    data: inputData,
    dimensions,
    atlasMode,
    lang,
    ...props
}) {
    /** @type {Object[]} */
    const data = useMemo(function prepareData() {
        let preparedData = inputData
            .filter(({ port, aggregate_type }) => port === 'Dunkerque' && aggregate_type === 'detail_products')
            .map(({ value, partner_type, product_type, ...rest }) => {
                return {
                    ...rest,
                    value: +value, // string to number
                    partner_type: translate('AlluvialImportExport', partner_type, lang),
                    product_type: translate('AlluvialImportExport', product_type, lang)
                }
            });
        return preparedData;
    }, [inputData, translate, lang]);
    // console.log('data', Array.from(new Set(data.map(d => d.product_type))).map(d => `${d}:
    //   fr: ${d}
    //   en: ${d}`).join('\n'));
    return (
        <AlluvialImportExport
            {...{
                dimensions,
                atlasMode,
                data,
                lang,
            }}
            colorPalette={palette}
        />
    )
}
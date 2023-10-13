import React, { useMemo } from "react"
import colorsPalettes from "../../utils/colorPalettes";

import AlluvialImportExport from "../../components/AlluvialImportExport";

const {importsExports: palette} = colorsPalettes;

export default function EstimationExportsDkSnail({
    data: inputData,
    dimensions,
    atlasMode,
    ...props
}) {
    /** @type {Object[]} */
    const data = useMemo(function prepareData() {
        let preparedData = inputData
            // .filter(({ port, aggregate_type }) => port === 'Dunkerque' && aggregate_type === 'detail_products')
            .map(({ value, ...rest }) => {
                return {
                    value: parseInt(+value), // string to number
                    ...rest
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
            colorPalette={{
              ...palette,
              'Fraude': 'grey',
              'bureau des fermes de Dunkerque': '#082d45',
              '': '#9bb5c6'
            }}
        />
    )
}
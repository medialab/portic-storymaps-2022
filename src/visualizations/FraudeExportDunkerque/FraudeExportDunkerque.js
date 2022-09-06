import React, { useMemo } from "react"
import colorsPalettes from "../../utils/colorPalettes";

import AlluvialImportExport from "../../components/AlluvialImportExport";

const {importsExports: palette} = colorsPalettes;

export default function FraudeExportDunkerque({
    data: inputData,
    dimensions,
    ...props
}) {
    /** @type {Object[]} */
    const data = useMemo(function prepareData() {
        let preparedData = inputData
            .filter(({ port, aggregate_type }) => port === 'Dunkerque' && aggregate_type === 'detail_products')
            .map(({ value, ...rest }) => {
                return {
                    value: +value, // string to number
                    ...rest
                }
            });
        return preparedData;
    }, [inputData]);

    return (
        <AlluvialImportExport
            {...{
                dimensions,
                data
            }}
            colorPalette={palette}
        />
    )
}
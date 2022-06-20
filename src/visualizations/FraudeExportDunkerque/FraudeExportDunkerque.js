import React, { useMemo } from "react"

import AlluvialImportExport from "../../components/AlluvialImportExport";

export default function FraudeExportDunkerque({
    data: inputData,
    dimensions,
    ...props
}) {
    /** @type {Object[]} */
    const data = useMemo(function prepareData() {
        let preparedData = inputData
            .filter(({ port }) => port === 'Dunkerque')
            .filter(({ aggregate_type }) => aggregate_type === 'detail_products')
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
        />
    )
}
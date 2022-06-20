import React, { useMemo } from "react"

import AlluvialImportExport from "../../components/AlluvialImportExport";

export default function FraudeExportPortFranc({
    data: inputData,
    dimensions,
    ...props
}) {
    const { width, height } = dimensions;

    /** @type {Object[]} */
    const data = useMemo(function prepareData() {
        let preparedData = inputData
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
        <>
            <div
                style={{
                    display: 'flex'
                }}
            >
                <AlluvialImportExport
                    dimensions={{
                        width: width / 2,
                        height: height / 2
                    }}
                    data={data.filter(({ port }) => port === 'Dunkerque')}
                />
                <AlluvialImportExport
                    dimensions={{
                        width: width / 2,
                        height: height / 2
                    }}
                    data={data.filter(({ port }) => port === 'Marseille')}
                />
            </div>
            <div
                style={{
                    display: 'flex'
                }}
            >
                <AlluvialImportExport
                    dimensions={{
                        width: width / 2,
                        height: height / 2
                    }}
                    data={data.filter(({ port }) => port === 'Lorient')}
                />
                <AlluvialImportExport
                    dimensions={{
                        width: width / 2,
                        height: height / 2
                    }}
                    data={data.filter(({ port }) => port === 'Bayonne')}
                />
            </div>
        </>
    )
}
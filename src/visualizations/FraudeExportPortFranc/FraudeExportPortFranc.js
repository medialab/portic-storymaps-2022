import React, { useMemo } from "react"

import AlluvialImportExport from "../../components/AlluvialImportExport";

import './FraudeExportPortFranc.scss';

export default function FraudeExportPortFranc({
    data: inputData,
    dimensions,
    ...props
}) {
    const { width, height } = dimensions;
    const margin = 40;

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
                className='FraudeExportPortFranc-row'
            >
                <div>
                    <AlluvialImportExport
                        dimensions={{
                            width: (width / 2) - margin,
                            height: (height / 2) - margin
                        }}
                        data={data.filter(({ port }) => port === 'Dunkerque')}
                    />
                </div>
                <div>
                    <AlluvialImportExport
                        dimensions={{
                            width: (width / 2) - margin,
                            height: (height / 2) - margin
                        }}
                        data={data.filter(({ port }) => port === 'Marseille')}
                    />
                </div>
            </div>
            <div
                className='FraudeExportPortFranc-row'
            >
                <div>
                    <AlluvialImportExport
                        dimensions={{
                            width: (width / 2) - margin,
                            height: (height / 2) - margin
                        }}
                        data={data.filter(({ port }) => port === 'Lorient')}
                    />
                </div>
                <div>
                    <AlluvialImportExport
                        dimensions={{
                            width: (width / 2) - margin,
                            height: (height / 2) - margin
                        }}
                        data={data.filter(({ port }) => port === 'Bayonne')}
                    />
                </div>
            </div>
        </>
    )
}
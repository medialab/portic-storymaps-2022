import React, { useMemo, useReducer } from "react";

import colorsPalettes from "../../utils/colorPalettes";

import AlluvialImportExport from "../../components/AlluvialImportExport";

import './FraudeExportPortFranc.scss';

const {importsExports: palette} = colorsPalettes;

export default function FraudeExportPortFranc({
    data: inputData,
    dimensions,
    ...props
}) {
    const [focus, setFocus] = useReducer((lastState, newState) => {
        if (lastState === newState) { return undefined; }
        return newState;
    }, undefined);

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

    const focusRatio = 0.7;

    return (
        <div
            className='FraudeExportPortFranc'
            style={{
                width,
                height
            }}
        >
            <div className='FraudeExportPortFranc-row' >
                {/* <div className='FraudeExportPortFranc-box'>
                    <h3 onClick={() => setFocus('Dunkerque')}>Dunkerque</h3>
                    <AlluvialImportExport
                        dimensions={{
                            width: width * (focus === undefined ? 0.5 : (focus === 'Dunkerque' ? focusRatio : 1 - focusRatio)),
                            height: height * (focus === undefined ? 0.5 : (focus === 'Dunkerque' ? focusRatio : 1 - focusRatio))
                        }}
                        colorPalette={palette}
                        data={data.filter(({ port, aggregate_type }) => port === 'Dunkerque' && aggregate_type === 'detail_products')}
                    />
                </div> */}
                <div className='FraudeExportPortFranc-box'>
                    <h3 onClick={() => setFocus('Marseille')}>Marseille</h3>
                    <AlluvialImportExport
                        dimensions={{
                            width: width * (focus === undefined ? 0.5 : (focus === 'Marseille' ? focusRatio : 1 - focusRatio)),
                            height: height * (focus === undefined ? 0.5 : (focus === 'Marseille' ? focusRatio : 1 - focusRatio))
                        }}
                        colorPalette={palette}
                        data={data.filter(({ port, aggregate_type }) => port === 'Marseille' && aggregate_type === 'detail_products')}
                    />
                </div>
                <div className='FraudeExportPortFranc-box'>
                    <h3 onClick={() => setFocus('Bayonne')}>Bayonne</h3>
                    <AlluvialImportExport
                        dimensions={{
                            width: width * (focus === undefined ? 0.5 : (focus === 'Bayonne' ? focusRatio : 1 - focusRatio)),
                            height: height * (focus === undefined ? 0.5 : (focus === 'Bayonne' ? focusRatio : 1 - focusRatio))
                        }}
                        colorPalette={palette}
                        data={data.filter(({ port, aggregate_type }) => port === 'Bayonne' && aggregate_type === 'detail_products')}
                    />
                </div>
            </div>
            <div className='FraudeExportPortFranc-row'>
                {/* <div className='FraudeExportPortFranc-box'>
                    <h3 onClick={() => setFocus('Lorient')}>Lorient</h3>
                    <AlluvialImportExport
                        dimensions={{
                            width: width * (focus === undefined ? 0.5 : (focus === 'Lorient' ? focusRatio : 1 - focusRatio)),
                            height: height * (focus === undefined ? 0.5 : (focus === 'Lorient' ? focusRatio : 1 - focusRatio))
                        }}
                        colorPalette={palette}
                        data={data.filter(({ port, aggregate_type }) => port === 'Lorient' && aggregate_type === 'detail_products')}
                    />
                </div> */}
                {/* <div className='FraudeExportPortFranc-box'>
                    <h3 onClick={() => setFocus('Bayonne')}>Bayonne</h3>
                    <AlluvialImportExport
                        dimensions={{
                            width: width * (focus === undefined ? 0.5 : (focus === 'Bayonne' ? focusRatio : 1 - focusRatio)),
                            height: height * (focus === undefined ? 0.5 : (focus === 'Bayonne' ? focusRatio : 1 - focusRatio))
                        }}
                        colorPalette={palette}
                        data={data.filter(({ port, aggregate_type }) => port === 'Bayonne' && aggregate_type === 'detail_products')}
                    />
                </div> */}
            </div>
        </div>
    )
}
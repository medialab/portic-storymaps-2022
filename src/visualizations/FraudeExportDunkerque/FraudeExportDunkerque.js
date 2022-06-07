import React, { useMemo } from "react"

import AlluvialImportExport from "../../components/AlluvialImportExport";

export default function FraudeExportDunkerque({
    data: inputData,
    dimensions,
    ...props
}) {
    /** @type {Object[]} */
    const data = useMemo(function prepareData() {
        let preparedData = inputData['fraude-exports.csv']
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
    

    // const data = useMemo(function prepareData() {
        // let preparedData = inputData['fraude-exports-dunkerque.csv'].map(({
        //     valeur_export_france,
        //     valeur_export_colonies,
        //     valeur_export_monde,
        //     valeur_import_colonies,
        //     valeur_import_france,
        //     valeur_import_monde,
        //     ...rest
        // }) => {
        //     return { // string to number
        //         valeur_export_france: +valeur_export_france,
        //         valeur_export_colonies: +valeur_export_colonies,
        //         valeur_export_monde: +valeur_export_monde,
        //         valeur_import_colonies: +valeur_import_colonies,
        //         valeur_import_france: +valeur_import_france,
        //         valeur_import_monde: +valeur_import_monde,
        //         ...rest
        //     }
        // });

    //     preparedData = preparedData.map(({ produit, ...rest }) => {
    //         const importTotal = rest['valeur_import_monde'] + rest['valeur_import_france'] + rest['valeur_import_colonies']
    //             , exportTotal = rest['valeur_export_monde'] + rest['valeur_export_france'] + rest['valeur_export_colonies'];
    //         return {
    //             produit,
    //             import: {
    //                 monde: rest['valeur_import_monde'],
    //                 france: rest['valeur_import_france'],
    //                 colonies: rest['valeur_import_colonies'],
    //             },
    //             export: {
    //                 monde: rest['valeur_export_monde'],
    //                 france: rest['valeur_export_france'],
    //                 colonies: rest['valeur_export_colonies'],
    //                 fraude: importTotal - exportTotal
    //             }
    //         }
    //     })

    //     return preparedData;
    // }, [inputData]);

    // const productRange = useMemo(function getProductRange() {
    //     const { productBar: productBarHeight } = drawBlocksHeight;
    // }, [drawBlocksHeight])
}
import React, { useMemo } from 'react';
import translate from '../../utils/translate';
import BoatBarChart from './BoatBarChart';

export default function Pilotage({
    data: inputData,
    lang,
    colorPalette = {
        'total': '#ff493b',
        'sorties_pilotage': '#2f2d8d',
    },
    ...props
}) {
    const data = useMemo(function prepareData() {
        return inputData.map(({ year, sorties_pilotage, navires, total, ...rest }) => {
            return {
                ...rest,
                year: +year,
                sorties_pilotage: (sorties_pilotage === '' ? undefined : +sorties_pilotage),
                total: (total === '' ? undefined : +total)
            }
        })
    }, [inputData]);


    return (
        <>
            <h3>{translate('Pilotage', 'title_comparaison', lang)}</h3>
            <BoatBarChart
                { ...{ colorPalette, lang } }
                data={data.filter(({ total }) => total !== undefined )}
                dimensions={{
                    width: 450,
                    height: 250
                }}
            />
            <h3>{translate('Pilotage', 'title_estimation', lang)}</h3>
        </>
    )
}
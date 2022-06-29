import React, { useMemo, useReducer } from "react";

import GeographicMapChart from "../../components/GeographicMapChart";
import { formatNumber, reducerBrush } from "../../utils/misc";
import translate from "../../utils/translate";

import LineChart from '../../components/LineChart';
import { scaleLinear } from "d3-scale";
import { groups, max } from "d3-array";

export default function PecheMap({
    data,
    dimensions,
    lang,
    colorPalette = {
        'Islande': 'red',
        'Terre-Neuve': 'blue',
        'Hitlande': 'purple',
        'Hareng': 'orange',
        'Dogre Banc': 'brown'
    },
    ...props
}) {
    const { width, height } = dimensions;
    const [brush, setBrush] = useReducer(reducerBrush, [undefined, undefined, undefined]);
    const dataMap = data.get('map_backgrounds/world_map.geojson');
    const dataStats = useMemo(function prepareData() {
        return data.get('peche-map-stats.csv').map(row => {
            return {
                ...row,
                value: row['value'] === '' ? 0 : +row['value']
            }
        })
    }, [data]);

    const colors = useMemo(function scaleColors() {
        const colorsScale = {};
        for (const [zone, color] of Object.entries(colorPalette)) {
            const maxValueForTypeZone = max(dataStats.filter(({ type_zone_peche }) => type_zone_peche === type_zone_peche), d => d['value'])
            colorsScale[zone] = scaleLinear().domain([1,maxValueForTypeZone]).range(["white", color])
        }
        return colorsScale;
    }, [data]);

    return (
        <>
            {/* <GeographicMapChart
                projectionTemplate={'world north'}
                layers={[
                    {
                        type: 'choropleth',
                        animated: true,
                        data: data.get('evolution-peche-zones.geojson'),
                        tooltip: (d) => d.properties.identifiant,
                        color: {
                            field: 'identifiant',
                            palette: {
                                // 'Islande': 'red',
                                // 'Terre-Neuve': 'blue',
                                // 'Shetlands': 'white',
                                'Dunkerque_mer_du_nor': colors['Dogre Banc'](2),
                            }
                        }
                    },
                    {
                        type: 'choropleth',
                        animated: true,
                        data: dataMap,// currentProjectionTemplate === 'World' ? datasets['map_world_1789.geojson'] : datasets['map_france_1789.geojson'],
                    }
                ]}
                height={height - 200}
                width={width}
            /> */}

            <LineChart
                width={width}
                height={200}
                data={dataStats}
                x={{
                    field: 'annee',
                    title: translate('PecheMap', 'x', lang)
                }}
                y={{
                    field: 'value',
                    title: translate('PecheMap', 'y', lang)
                }}
                color={{
                    field: 'type_zone_peche'
                }}
                tooltip={
                    (d) => translate('PecheMap', 'tooltip', lang, {
                        type: d['type_zone_peche'],
                        value: formatNumber(d['value']),
                        year: d['annee']
                    })
                }
                margins={{
                    left: 100,
                    top: 50,
                    bottom: 40,
                    right: 20
                }}
                brushState={[brush, setBrush]}
            />
        </>
    )
}
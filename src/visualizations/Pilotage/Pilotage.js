import React, { useMemo } from 'react';
import translate from '../../utils/translate';
import BoatBarChart from './BoatBarChart';
import BarChartEstimation from './BarChartEstimation';
import PilotageLegend from './PilotageLegend';

import { mean, extent } from 'd3-array';

import './Pilotage.scss';
import SchemaDemonstration from './SchemaDemonstration';

const BREAK_POINT = 900;

export default function Pilotage({
    data: inputData,
    dimensions,
    lang,
    colorPalette = {
        'total': '#ff493b',
        'sorties_pilotage': '#2f2d8d',
        // 'projection': '#c24153',
        'projection': 'grey'
    },
    atlasMode,
    callerProps = {},
    ...props
}) {
    const { width, height } = dimensions;

    const {
      methodo_uniquement = false,
      resultat_uniquement = false
    } = callerProps;


    const isSlim = useMemo(() => width < BREAK_POINT, [width]);

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

    // data with lines 'total' and 'sorties_pilotage' to compute the projection
    const dataForProjection = useMemo(function filterData() {
        return data.filter(({ total, sorties_pilotage }) => total !== undefined && sorties_pilotage !== undefined);
    }, [data]);
    const yearPeriodForProjection = useMemo(() => extent(dataForProjection, d => d['year']), [dataForProjection]);

    const projectionStats = useMemo(function computeData() {
        const pilotageOnTotalPourcentagePerYear = dataForProjection.map(({ total, sorties_pilotage }) => {
            return (sorties_pilotage / total) * 100;
        });
        const pilotageOnTotalPourcentagePerYearMean = mean(pilotageOnTotalPourcentagePerYear);
        const projectionPerYear = dataForProjection.map(({ sorties_pilotage, total, year }) => {
            const pilotageByProjection = (sorties_pilotage * 100) / pilotageOnTotalPourcentagePerYearMean;
            const realityGap = total - pilotageByProjection;
            const realityGapPourcentage = (realityGap / pilotageByProjection) * 100;
            return {
                year,
                pilotageByProjection,
                realityGap,
                realityGapPourcentage
            };
        });
        let [minProjectionPerYear, maxProjectionPerYear] = extent(projectionPerYear, d => d['realityGapPourcentage']);
        minProjectionPerYear = minProjectionPerYear.toFixed(2);
        maxProjectionPerYear = maxProjectionPerYear.toFixed(2);
        return {
            projectionPerYear,
            minProjectionPerYear,
            maxProjectionPerYear,
            meanProjectionPerYear: pilotageOnTotalPourcentagePerYearMean
        };
    }, [dataForProjection]);

    return (
        <div className={`Pilotage ${isSlim ? 'is-slim': ''} ${atlasMode ? 'is-atlas-mode' : 'is-scrolly-mode'} ${methodo_uniquement ? 'methodo-only': ''} ${resultat_uniquement ? 'result-only': ''}`}
          style={{
            maxWidth: width,
            maxHeight: atlasMode ? undefined : height
          }}
        >
            <div
              className="row upper-row"
            >
                <div
                  className="explanation-left"
                >
                    <div
                      className="legend-container"
                    >
                        <h3
                          dangerouslySetInnerHTML={{
                            __html: translate('Pilotage', 'title_comparaison', lang)
                          }}
                        />
                        <PilotageLegend
                            {...{ colorPalette, lang }}
                            dimensions={{
                                width: isSlim && methodo_uniquement ? width : width * .5,
                                height: 40
                            }}
                        />
                    </div>
                    <BoatBarChart
                        {...{ colorPalette, lang }}
                        data={dataForProjection}
                        dimensions={{
                            width: isSlim && methodo_uniquement ? width : width * .5,
                            height: methodo_uniquement ? height / 4 : 250
                        }}
                    />
                </div>
                <div className="explanation-right"
                  style={{
                    maxWidth: isSlim ? width : width * .5 - 10,
                  }}
                >
                  <SchemaDemonstration
                      {...{ lang, colorPalette, projectionStats }}
                      data={dataForProjection}
                      dimensions={{
                          width: isSlim && methodo_uniquement ? width : width * .5 - 10,
                          height: isSlim ? height / 3 : 300
                      }}
                  />
                </div>
            </div>
            <div className="row lower-row">
              <h3>{translate('Pilotage', 'title_estimation', lang)}</h3>
              <BarChartEstimation
                  {...{ colorPalette, lang, data, yearPeriodForProjection, projectionStats }}
                  dimensions={{
                      width: width - 50,
                      height: (!atlasMode && isSlim) ? resultat_uniquement ? height : height / 2 : 400
                  }}
              />
            </div>
        </div>
    )
}
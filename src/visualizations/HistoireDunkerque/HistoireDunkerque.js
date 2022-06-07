import React, { useEffect, useMemo, useRef, useState } from "react";

import { VisualisationContext } from "../../utils/contexts";

import Timeline from "./Timeline";

import './MapDunkerquePort.scss'

/**
 * 
 * @param {Object} props
 * @param {Object[]} props.data
 * @param {Object} props.dimensions
 * @param {Number} props.dimensions.width
 * @param {Number} props.dimensions.height
 * @param {Object} props.callerProps
 * @param {String} props.callerProps.year
 * @param {Object} props.callerProps.object
 * @returns 
 */

export default function HistoireDunkerque({
    data: inputData,
    dimensions,
    callerProps,
    ...props
}) {
    const [mapBackgroundPath, setMapBackgroundPath] = useState(undefined);
    const [mapLayerPath, setMapLayerPath] = useState(undefined);
    const [yearMark, setYearMark] = useState(undefined);

    const data = useMemo(() => {
        return inputData['histoire-dunkerque.csv'].map(({...rest}) => {
            const {year, object} = rest;
            return {
                id: [year, object].join('_'),
                ...rest
            }
        });
    }, [inputData]);

    const mapDimensions = useMemo(() => {
        return {
            width: dimensions.width,
            height: dimensions.height * 0.7
        }
    }, [dimensions]);

    const timelineDimension = useMemo(() => {
        return {
            width: dimensions.width,
            height: dimensions.height * 0.3
        }
    }, [dimensions]);

    useEffect(() => {
        const path = process.env.BASE_PATH + '/assets';
        setMapBackgroundPath(path + '/dunkerque_map.jpg');
    }, []);

    const mapRef = useRef(null);

    function changeMapView(id, xCoordinate) {
        const { file, year } = data.find(({id: rowId}) => rowId === id);
        const pathSvg = process.env.BASE_PATH + '/assets';
        setMapLayerPath(pathSvg + '/' + file);
        setYearMark({
            year,
            x: xCoordinate
        });
    }

    function resetMapView() {
        setMapLayerPath(undefined);
        setYearMark(undefined);
    }
    
    return (
        <div ref={mapRef} className='MapDunkerquePort' style={{ ...dimensions }}>
            <div className="map-container" style={{ ...mapDimensions }}>
                <img className='layer' src={mapLayerPath} />
                <img className='base' src={mapBackgroundPath} />
            </div>

            <VisualisationContext.Provider value={{
                changeMapView,
                resetMapView,
                yearMark
            }}>
                <Timeline
                    { ...{ data, callerProps } }
                    dimensions={timelineDimension}
                />
            </VisualisationContext.Provider>
        </div>
    )
}
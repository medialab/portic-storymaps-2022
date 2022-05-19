import React, { createContext, useEffect, useMemo, useRef, useState } from "react";

import { fetchDataSvg } from "../../utils/fetch";
import { VisualisationContext } from "../../utils/contexts";

import Timeline from "./Timeline";

import './MapDunkerquePort.scss'

export default function MapDunkerquePort({
    title,
    data: inputData,
    dimensions,
    callerProps,
    ...props
}) {
    const [mapBackgroundPath, setMapBackgroundPath] = useState(undefined);
    const [mapLayerPath, setMapLayerPath] = useState(undefined);
    const [yearMark, setYearMark] = useState(undefined);

    const data = useMemo(() => {
        return inputData['map.csv'].map(({...rest}) => {
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
            height: dimensions.height * 0.6
        }
    }, [dimensions]);

    const timelineDimension = useMemo(() => {
        return {
            width: dimensions.width,
            height: dimensions.height * 0.2
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
    
    return (
        <div ref={mapRef} className='MapDunkerquePort' style={{ ...dimensions }}>
            <h3>{title}</h3>

            <div className="map-container" style={{ ...mapDimensions }}>
                <img className='layer' src={mapLayerPath} />
                <img className='base' src={mapBackgroundPath} />
            </div>

            <VisualisationContext.Provider value={{
                changeMapView,
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
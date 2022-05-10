import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';

import Loader from '../Loader';
import VisualizationController from '../../visualizations/index';

import visualizationsMetas from '../../data/viz.json';
import { fetchDataCsv } from '../../utils/fetch';
import './StandaloneVisualization.scss'

export default function StandaloneVisualization({
    ...props
}) {
    const { vizId, lang } = useParams();

    const [data, setData] = useState(undefined);
    const [loadingState, setLoadingState] = useState('none');

    useEffect(() => {
        if (!!vizId === false || visualizationsMetas[vizId] === undefined) {
            setLoadingState('none');
            return;
        }

        setLoadingState('process');
        // @todo handle case in which an incorrect viz id is provided
        const { outputs, ...metas } = visualizationsMetas[vizId];

        Promise.all(
            outputs.map(fileToLoad => fetchDataCsv(fileToLoad))
        )
            .then((datasets) => {
                let payload = {};
                for (let i = 0; i < datasets.length; i++) {
                    payload[outputs[i]] = datasets[i];
                }
                setData(payload);
                setLoadingState('successed');
            })
            .catch((error) => {
                setLoadingState('failed');
                console.error(error);
            })

    }, [vizId])

    return (
        <div className="StandaloneVisualization">
            {
                loadingState === 'successed' ?
                    <VisualizationController
                        focusedVizId={vizId}
                        lang={lang}
                        data={data}
                        dimensions={{
                            width: 1000,
                            height: 1000
                        }}
                    />
                    :
                    {
                        'process': <Loader message='En cours de chargement' />,
                        'failed': <Loader message='Erreur de chargement' />,
                        'none': null
                    }[loadingState]
            }
        </div>
    )
}
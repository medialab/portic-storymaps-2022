import React, { useState, useEffect, useMemo } from 'react';

import Loader from '../Loader';
import SmogglagePortsStats from '../../visualizations/SmogglagePortsStats';

import { fetchDataCsv } from '../../utils/fetch';

/* eslint-disable import/no-webpack-loader-syntax */
// import Mdx from '!@mdx-js/loader!../content/home.mdx';

export default function Home ({
    ...props
}) {
    /**
     * @type {['current'|'successed'|'failed', Function]}
     * @typedef {Function} setloadingState Loading state of the data for vizusalisations
     */
    const [loadingState, setloadingState] = useState('current');
    /**
     * @type {[Array, Function]}
     * @typedef {Function} setData
     */
    const [data, setData] = useState();

    useEffect(() => {
        fetchDataCsv('smogglage_ports_stats.csv')
            .then((data) => {
                setData(data);
                setloadingState('successed');
            })
    }, [])

    const renderMainContent = useMemo(() => {
        return () => {
            switch (loadingState) {
                case 'successed':
                    return <SmogglagePortsStats data={data} />

                case 'current':
                    return <Loader message="Chargement en cours" />;

                case 'failed':
                default:
                    return <Loader message="Échec du chargement" />;
            }
        }
    }, [loadingState, data])
    
    return (
        <>
            <h1 className='title'>Accueil</h1>
            { renderMainContent() }
        </>
    );
}
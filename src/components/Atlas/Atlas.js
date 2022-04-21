import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet";
import cx from 'classnames';

import visualizationsMetas from '../../data/viz';
import Loader from '../Loader';
import VisualizationFocus from '../VisualizationFocus';

import translate from '../../utils/translate';
import { buildPageTitle } from '../../utils/misc';
import { fetchDataCsv } from '../../utils/fetch';

import './Atlas.scss';


export default function Atlas({
    ...props
}) {
    const { vizId, lang } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(undefined);
    const [vizMetas, setVizMetas] = useState(undefined);
    const [vizIdToFocus, setVizIdToFocus] = useState(vizId);
    /** @type {['process'|'failed'|'successed'|'none', Function]} */
    const [loadingState, setLoadingState] = useState('none');

    /**
     * Launch focus on a viz
     * @param {String} vizId 
     */
    function onClickFocus (vizId) {
        navigate(`/${lang}/atlas/${vizId}`);
    }

    useEffect(() => {
        if (!!vizIdToFocus === false) {
            setLoadingState('none');
            return;
        }

        setLoadingState('process');
        const { outputs, ...metas } = visualizationsMetas[vizIdToFocus];

        Promise.all(
            outputs.map(fileToLoad => fetchDataCsv(fileToLoad))
        )
        .then((datasets) => {
            let payload = {};
            for (let i = 0; i < datasets.length; i++) {
                payload[outputs[i]] = datasets[i];
            }
            setData(payload);
            setVizMetas(metas);
            setLoadingState('successed');
        })
        .catch((error) => {
            setLoadingState('failed');
            console.error(error);
        })

    }, [vizIdToFocus])

    if (loadingState === 'none') {
        return (
            <div className='Atlas secondary-page'>
                <Helmet>
                    <title>{buildPageTitle('Atlas', lang)}</title>
                </Helmet>
                <div className="centered-contents">
                    <h1 className='title'>{translate('atlas', 'title', lang)}</h1>
                    <ul>
                        {
                            Object.values(visualizationsMetas).map((metas, i) => {
                                const title = metas['titre_' + lang] || false
                                    , description = metas['description_' + lang] || false;
    
                                const { id, output } = metas;
    
                                return <li onClick={() => onClickFocus(id, output)}>{title}</li>
                            })
                        }
                    </ul>
                </div>
            </div>
        );
    }

    if (loadingState === 'process') {
        return <Loader message='En cours de chargement' />
    }
    if (loadingState === 'failed') {
        return <Loader message='Échec du chargement' />
    }

    if (loadingState === 'successed') {
        return (
            <VisualizationFocus
                focusedVizId={vizIdToFocus}
                data={data}
                onClickClose={(e) => navigate(`/${lang}/atlas`)}
            />
        )
    }
}
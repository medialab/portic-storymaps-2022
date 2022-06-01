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
    /** @type {['process'|'failed'|'successed'|'none', Function]} */
    const [loadingState, setLoadingState] = useState('none');

    /**
     * Launch focus on a viz
     * @param {String} vizId 
     */
    function onClickFocus(vizId) {
        navigate(`/${lang}/atlas/${vizId}`);
    }

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
                console.log('data is loaded');
                setData(payload);
                setVizMetas(metas);
                setLoadingState('successed');
            })
            .catch((error) => {
                setLoadingState('failed');
                console.error(error);
            })

    }, [vizId])

    useEffect(() => window.scrollTo({ top: 0 }), []);

    return (
        <div className='Atlas secondary-page'>
            <Helmet>
                <title>{buildPageTitle('Atlas', lang)}</title>
            </Helmet>
            <div className="centered-contents">
                <h1 className='title'>{translate('atlas', 'title', lang)}</h1>
                <ul className='visualizations-list'>
                    {
                        Object.values(visualizationsMetas).map((metas, i) => {
                            const title = metas['titre_' + lang] || false;

                            const { id, output } = metas;

                            return (
                                <li
                                    className='visualization-item'
                                    onClick={() => onClickFocus(id, output)}
                                >
                                    <figure className="thumbnail-container">
                                        <img
                                            className='thumbnail'
                                            src={`${process.env.BASE_PATH}/thumbnails/${lang}/${id}.png`}
                                        />
                                        <figcaption className='visualization-title'>{title}</figcaption>
                                    </figure>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
            {
                vizId ?
                    <div>
                        {
                            loadingState === 'successed' ?
                                <VisualizationFocus
                                    vizId={vizId}
                                    data={data}
                                    onClickClose={(e) => navigate(`/${lang}/atlas`)}
                                />
                                :
                                {
                                    'process': <Loader message='En cours de chargement' />,
                                    'failed': <Loader message='Erreur de chargement' />,
                                    'none': null
                                }[loadingState]
                        }
                    </div>
                    : null
            }
        </div>
    )
}
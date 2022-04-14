import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from "react-helmet";
import cx from 'classnames';

// charger le json de la liste des visualisations de l'atlas
import visualizationsMetas from '../../data/viz';
import VisualizationFocus from '../../components/VisualizationFocus/VisualizationFocus';

import translate from '../../utils/translate';
import { buildPageTitle } from '../../utils/misc';

import './Atlas.scss';

export default function Atlas({
    ...props
}) {
    const { vizId, lang } = useParams();

    /**
     * Launch focus on a viz
     * @param {Array} csvFiles 
     */
    function onClickFocus (vizId, csvFiles) {
        console.log('focus');
    }

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
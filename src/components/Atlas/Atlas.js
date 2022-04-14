import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from "react-helmet";
import cx from 'classnames';

// charger le json de la liste des visualisations de l'atlas
import visualizations from '../../data/viz';
import VisualizationFocus from '../../components/VisualizationFocus/VisualizationFocus';

import { SettingsContext } from '../../utils/contexts';
import translate from '../../utils/translate';
import { buildPageTitle } from '../../utils/misc';

import './Atlas.scss';

export default function Atlas({
    ...props
}) {
    const { vizId, lang } = useParams();

    return (
        <div className='Atlas secondary-page'>
            <Helmet>
                <title>{buildPageTitle('Atlas', lang)}</title>
            </Helmet>
            <div className="centered-contents">
                <h1 className='title'>{translate('atlas', 'title', lang)}</h1>
            </div>
        </div>
    );
}
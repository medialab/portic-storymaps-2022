import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Helmet} from "react-helmet";
import cx from 'classnames';

// charger le json de la liste des visualisations de l'atlas
import visualizations from '../../data/viz';
import VisualizationFocus from '../../components/VisualizationFocus/VisualizationFocus';

import {buildPageTitle} from '../../utils/misc';

import './Atlas.scss';


const visualizationsMap = Object.values(visualizations).reduce((res, visualization) => ({
  ...res,
  [visualization.id]: visualization
}), {})

function Atlas({
  match: {
    params: {
      visualizationId,
      lang = 'fr'
    }
  }
}) {
  /**
   * Scroll to top on mount
   */
   useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const history = useNavigate();
  const shownVisualization = visualizationId && visualizationsMap[visualizationId];
  return (
    <div className={cx("Atlas secondary-page", {'has-focus': shownVisualization})}>
      <Helmet>
        <title>{buildPageTitle('Atlas', lang)}</title>
      </Helmet>
      <div className="centered-contents">
        <h1>{lang === 'fr' ? 'Atlas des visualisations' : 'Visualizations atlas'}</h1>
        <ul className="visualizations-list">
          {
            visualizations.map((visualization, visualizationIndex) => {
              const handleClick = () => {
                setIsLoading(true);
                setTimeout(() => {
                  history.push({
                    pathname: `/${lang}/atlas/${visualization.id}`
                  });
                  setIsLoading(false);
                }, 100)
              }
              return (
                <li
                  className={cx('visualization-item', { 'is-active': shownVisualization && shownVisualization.id === visualization.id })}
                  onClick={handleClick}
                  key={visualizationIndex}
                >
                  <figure className="thumbnail-container">
                      <img
                        src={`${process.env.PUBLIC_URL}/thumbnails/${lang}/${visualization.id}.png`}
                        alt={visualization[`titre_${lang}`]}
                      />
                  </figure>
                  <h5 className="visualization-title">
                    {visualization[`titre_${lang}`]}
                  </h5>
                </li>
              )
            })
          }
        </ul>
      </div>
        <VisualizationFocus 
          visualization={shownVisualization} 
          lang={lang}
          onClose={() => {
            history.push({
              pathname: `/${lang}/atlas/`
            })
          }}
        />
        <div className={cx("loader-indication-wrapper", {'is-loading': isLoading})}>
          <div className="loader-indication-container">
            {lang === 'fr' ? 'Chargement de la visualisation' : 'Loading visualization'}
          </div>
        </div>
    </div>
  );
}

export default Atlas;
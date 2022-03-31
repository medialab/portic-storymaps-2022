// @TODO : colorLegends et titres à mettre en place pour cartes notamment
// @TODO : faire une passe sur visualizationList.json que j'ai rempli approximativement pour les vizs 'intro-provinces', 'intro-ports', et 'intro-bureaux'

import { useContext, useMemo } from 'react';

import { DatasetsContext } from '../utils/contexts';

import visualizationsList from '../data/viz';

/**
 * This script is the bridge between visualization code, visualizations list, and visualization callers in contents.
 * It returns a visualization component depending on the provided id
 * @param {string} id
 * @param {object} dimensions
 * @param {object} - additional props
 * @returns {React.ReactElement} - React component
 */
const VisualizationContainer = ({ 
  id, 
  dimensions: inputDimensions, 
  ...props 
}) => {
  const dimensions = {
    ...inputDimensions,
    // height: inputDimensions.height - inputDimensions.top / 2
  }
  const datasets = useContext(DatasetsContext);

  const relevantDatasets = useMemo(() => {
    const viz = Object.values(visualizationsList).find(v => v.id === id);
    if (viz) {
      const datasetsIds = viz.datasets && viz.datasets.split(',').map(d => d.trim());
      if (datasetsIds.length && datasets) {
        return datasetsIds.reduce((cur, id) => ({
          ...cur,
          [id]: datasets[id]
        }), {})
      }
    }
  }, [id, datasets]);

  const hasData = Object.keys(relevantDatasets || {}).length && !Object.entries(relevantDatasets).find(([id, payload]) => !payload);
  // @todo uncomment this when data retrieval is set up
  // if (!hasData) {
  //   return null;
  // }
  switch (id) {
    default:
      return <div>
        <h1>Visualisation par encore développée (ou id invalide dans le google docs) : <code>{id}</code></h1>
        <pre><code>{JSON.stringify(props)}</code></pre>
        </div>;
  }
}

export default VisualizationContainer;
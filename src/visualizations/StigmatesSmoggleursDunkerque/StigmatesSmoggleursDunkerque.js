import React, { useMemo, useState, useRef } from 'react';
import Measure from 'react-measure';

import AlluvialChart from '../../components/AlluvialChart';

import translate from '../../utils/translate';

import colorsPalettes from '../../utils/colorPalettes';

import './StigmatesSmoggleursDunkerque.scss';

const {britishColor} = colorsPalettes;

/**
 * @param {Object} props
 * @param {Object[]} props.data
 * @param {Object} props.dimensions
 * @param {Number} props.dimensions.width
 * @param {Number} props.dimensions.height
 * @returns 
 */

export default function StigmatesSmoggleursDunkerque({
  data: inputData,
  dimensions,
  lang,
  atlasMode,
  ...props
}) {
  const [buttonsDimensions, setButtonsDimensions] = useState({width: 0, height: 0})
  const [year, setYear] = useState('1787');

  const tonnageLabels = {
    '12': {
      fr: '12 tx',
      en: '12 tx'
    },
    '[1-20]': {
      fr: 'entre 1 et 20 tx',
      en: 'from 1 to 20 tx'
    },
    '[21-50]': {
      fr: 'entre 21 et 50 tx',
      en: 'from 21 to 50 tx'
    },
    '[51-100]': {
      fr: 'entre 51 et 100 tx',
      en: 'from 51 to 100 tx'
    },
    '[101-200]': {
      fr: 'entre 101 et 200 tx',
      en: 'from 101 to 200 tx'
    },
    '[201-500]': {
      fr: 'entre 201 et 500 tx',
      en: 'from 201 to 500 tx'
    },
  }
  const data = useMemo(() => {
    return inputData
      .filter(({ year: rowYear }) => year === rowYear)
      .sort((a, b) => {
        if (a.tonnage === "12") {
          return 1;
        }
        return -1;
      })
      .map((group) => {
        return {
          ...group,
          minimumTonnage: +group.tonnage.match(/[0-9]+/)[0],
          label: tonnageLabels[group.tonnage][lang], // group.tonnage === '12' ? '12 (smoggleurs)' : group.tonnage,
          destination: group.destination === '' ? 
            translate('StigmatesSmoggleurs', 'unknown', lang) 
            : 
            ['Lisbonne ou Bergen', 'Angleterre'].includes(group.destination) ?
              translate('StigmatesSmoggleurs', group.destination, lang)
             : group.destination,
        }
      })
  }, [inputData, year, lang, translate]);


  const steps = useMemo(() => [
    {
      field: 'tonnage',

      // sortType: 'length',
      // sortOrder: 'descending',

      sortType: 'field',
      sortField: 'minimumTonnage',
      // sortOrder: 'descending',

      title: translate('StigmatesSmoggleurs', 'step_1_title', lang),
      label: 'label'
    }, {
      field: 'destination',
      sortType: 'length',
      sortOrder: 'descending',
      title: translate('StigmatesSmoggleurs', 'step_2_title', lang)
    }], [lang, translate]);
  const years = ['1787', '1789'];
  const { width, height } = dimensions;

  const { chartHeight, formHeight } = useMemo(() => {
    return {
      chartHeight: height - buttonsDimensions.height
    }
  }, [height, buttonsDimensions]);

  function onInputChange(e) {
    const { target } = e;
    const { value } = target;
    setYear(value);
  }
  return (
    <div className="StigmatesSmoggleursDunkerque">
      <AlluvialChart
        dimensions={{
          width: atlasMode ? width : width - 10,
          height: chartHeight
        }}
        {...{
          data,
          steps,
          displayCounts: d => ` - ${d} ${lang === 'fr' ? 'trajets' : 'travels'}`,
          colorPalette: {
            '12': britishColor,
            '[21-50]': 'lightgrey',
            '[51-100]': 'grey',
            '[101-200]': 'darkgrey',
            'Angleterre': 'grey',
            'Lisbonne ou Bergen (smoggleurs)': britishColor,
            'England': 'grey',
            'Lisbon or Bergen (smogglers)': britishColor,
             
          }
        }}
      />
      <Measure
      bounds
      onResize={contentRect => {
        setButtonsDimensions(contentRect.bounds)
      }}
    >
      {({ measureRef }) => (
        <div className="buttons-container" ref={measureRef}>
        {
          years.map((inputYear, i) => (
            <button key={i} className={`Button ${year === inputYear ? 'is-active' : ''}`} onClick={() => setYear(inputYear)}>
              {inputYear}
            </button>
          ))
        }
      </div>
      )}
    </Measure>
      
    </div>
  )
}
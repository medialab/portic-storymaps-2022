import React, { useMemo, useState, useRef } from 'react';

import AlluvialChart from '../../components/AlluvialChart';

import translate from '../../utils/translate';

import './StigmatesSmoggleursDunkerque.scss';

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
  ...props
}) {
  const [year, setYear] = useState('1787');
  const buttonsRef = useRef(null);

  const tonnageLabels = {
    '12': {
      fr: '12 (smoggleurs)',
      en: '12 (smogglers)'
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
      chartHeight: height - (buttonsRef.current ? buttonsRef.current.getBoundingClientRect().height : 0)
    }
  }, [height, buttonsRef]);

  function onInputChange(e) {
    const { target } = e;
    const { value } = target;
    setYear(value);
  }

  return (
    <div className="StigmatesSmoggleursDunkerque">
      <AlluvialChart
        dimensions={{
          width,
          height: chartHeight
        }}
        {...{
          data,
          steps,
          displayCounts: d => ` - ${d} ${lang === 'fr' ? 'trajets' : 'travels'}`,
          colorPalette: {
            '12': 'red',
            '[21-50]': 'lightgrey',
            '[51-100]': 'grey',
            '[101-200]': 'darkgrey',
            'Angleterre': 'grey',
            'Lisbonne ou Bergen': 'red',
            'England': 'grey',
            'Lisbon or Bergen': 'red',
             
          }
        }}
      />
      <div className="buttons-container" ref={buttonsRef}>
        {
          years.map((inputYear, i) => (
            <button key={i} className={`Button ${year === inputYear ? 'is-active' : ''}`} onClick={() => setYear(inputYear)}>
              {inputYear}
            </button>
          ))
        }
      </div>
    </div>
  )
}
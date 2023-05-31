import React, { useMemo, useState, useRef } from 'react';

import AlluvialChart from '../../components/AlluvialChart';

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
  ...props
}) {
  const [year, setYear] = useState('1787');
  const buttonsRef = useRef(null);

  const tonnageLabels = {
    '12': '12 (smoggleurs)',
    '[1-20]': 'entre 1 et 20 tx',
    '[21-50]': 'entre 21 et 50 tx',
    '[51-100]': 'entre 51 et 100 tx',
    '[101-200]': 'entre 101 et 200 tx',
    '[201-500]': 'entre 201 et 500 tx',
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
          label: tonnageLabels[group.tonnage], // group.tonnage === '12' ? '12 (smoggleurs)' : group.tonnage,
          destination: group.destination === '' ? 'inconnu' : group.destination,
        }
      })
  }, [inputData, year]);


  const steps = useMemo(() => [
    {
      field: 'tonnage',

      // sortType: 'length',
      // sortOrder: 'descending',

      sortType: 'field',
      sortField: 'minimumTonnage',
      // sortOrder: 'descending',

      title: 'tonnage déclaré',
      label: 'label'
    }, {
      field: 'destination',
      sortType: 'length',
      sortOrder: 'descending',
      title: 'destination déclarée'
    }], []);
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
          displayCounts: d => ` - ${d} trajets`,
          colorPalette: {
            '12': 'red',
            '[21-50]': 'lightgrey',
            '[51-100]': 'grey',
            '[101-200]': 'darkgrey',
            'Angleterre': 'grey',
            'Lisbonne': 'red'
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
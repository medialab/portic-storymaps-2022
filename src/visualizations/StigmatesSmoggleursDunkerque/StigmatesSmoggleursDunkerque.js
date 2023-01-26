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
  const data = useMemo(() => {
    return inputData
    .filter(({ year: rowYear }) => year === rowYear)
    .sort((a, b) => {
      if (a.tonnage === "12") {
        return 1;
      }
      return -1;
    })
  }, [inputData, year]);

  const steps = ['tonnage', 'destination'];
  const years = ['1787', '1789'];
  const { width, height } = dimensions;

  const { chartHeight, formHeight } = useMemo(() => {
    return {
      chartHeight: height - (buttonsRef.current ? buttonsRef.current.getBoundingClientRect().height : 0)
    }
  }, [height, buttonsRef])

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
          colorPalette: {
            '12': 'red',
            '[21-50]': 'lightgrey',
            '[51-100]': 'grey',
            '[101-200]': 'darkgrey',
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
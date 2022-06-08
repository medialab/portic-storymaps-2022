import React, { useMemo, useState } from 'react';

import AlluvialChart from '../../components/AlluvialChart';

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

    const data = useMemo(() => {
        return inputData.filter(({ year: rowYear }) => year === rowYear);
    }, [inputData, year]);

    const steps = ['destination', 'tonnage'];
    const years = ['1787', '1789'];
    const { width, height } = dimensions;

    const { chartHeight, formHeight } = useMemo(() => {
        return {
            chartHeight: height * 0.9,
            formHeight: height * 0.1
        }
    }, [height])

    function onInputChange(e) {
        const { target } = e;
        const { value } = target;
        setYear(value);
    }

    return (
        <>
            <AlluvialChart
                dimensions = {{
                    width,
                    height: chartHeight
                }}
                {...{
                    data,
                    steps
                }}
            />
            <form
                onSubmit={(e) => e.preventDefault()}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                {
                    years.map((inputYear, i) => (
                        <span key={i}>
                            <input
                                onChange={onInputChange}
                                type="radio"
                                id={`stigmates-smoggleurs-dunkerque_year_${inputYear}`}
                                name="year"
                                value={inputYear}
                                checked={year === inputYear}
                            />
                            <label htmlFor={`stigmates-smoggleurs-dunkerque_year_${inputYear}`}>{inputYear}</label>
                        </span>
                    ))
                }
            </form>
        </>
    )
}
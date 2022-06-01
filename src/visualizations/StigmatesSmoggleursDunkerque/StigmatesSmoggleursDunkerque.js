import React, { useMemo, useState } from 'react';

import AlluvialChart from '../../components/AlluvialChart';

export default function StigmatesSmoggleursDunkerque({
    data: inputData,
    dimensions,
    ...props
}) {
    const [year, setYear] = useState('1787');

    const data = useMemo(() => {
        return inputData['stigmates-smoggleurs-dunkerque.csv']
            .filter(({ year: rowYear }) => year === rowYear);
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

    function onFormChange(e) {
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
                onChange={onFormChange}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                {
                    years.map(inputYear => (
                        <span>
                            <input
                                type="radio"
                                id={`stigmates-smoggleurs-dunkerque_year_${inputYear}`}
                                name="year"
                                value={inputYear}
                                checked={year === inputYear}
                            />
                            <label for={`stigmates-smoggleurs-dunkerque_year_${inputYear}`}>{inputYear}</label>
                        </span>
                    ))
                }
            </form>
        </>
    )
}
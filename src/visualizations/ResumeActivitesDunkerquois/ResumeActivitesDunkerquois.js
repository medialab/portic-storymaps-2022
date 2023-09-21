import { useState, useEffect } from "react";

import AlluvialChart from "../../components/AlluvialChart";


export default function ResumeActivitesDunkerquois({
  data,
  width,
  height,
  lang,
  atlasMode,
  callerProps = {}
}) {
  const {
    year: inputYear = '1787'
  } = callerProps;

  const [year, setYear] = useState(inputYear)

  useEffect(() => {
    setYear(inputYear)
  }, [inputYear]);

  const steps = [
    {
      field: 'ship_tonnage_class',
      title: 'classe de tonnage du navire',
      sortType: 'field',
      sortField: 'ship_tonnage_class_ranking',
      // label: 'smoggleurLabel',
      // sortOrder: 'descending'
    },
    {
      field: 'departure',
      title: 'port de départ',
      // label: 'smoggleurLabel',
      sortOrder: 'descending'
    },
    {
      field: 'destination_state',
      title: 'port de destination',
      sortOrder: 'descending',
      // label: 'portLabel'
    },
    {
      field: 'cargo_type',
      title: 'type de cargaison',
      // sortOrder: 'descending',
      // label: 'portLabel'
    },

  ];

  return (
    <div className="ResumeActivitesDunkerquois">
      <AlluvialChart
        {...{
          data: data.filter(d => d.year === year),
          steps,
          quantifierField: 'rel_tonnage',
          dimensions: { width, height },
          colorPalette: {
            ...Array.from(new Set(data
              .sort((a, b) => {
                if (a.ship_tonnage_class_ranking > b.ship_tonnage_class_ranking) {
                  return 1;
                }
                return -1;
              })
              .map(d => d.ship_tonnage_class)))
              .reduce((res, tonnageClass, index) => ({ ...res, [tonnageClass]: `rgba(0,0,0, ${(index + 1) / 7})` }), {}),

            ...Array.from(new Set(data.map(d => d.departure)))
              .reduce((res, port) => ({ ...res, [port]: 'grey' }), {}),
            ...Array.from(new Set(data.map(d => d.destination_state)))
              .reduce((res, port) => ({ ...res, [port]: 'grey' }), {}),

            'Dunkerque': 'red',
            'France': 'red',
          }
        }}
      />
      {/* <div className="buttons-container" style={{ margin: '1rem' }}>
        <button className={`Button ${year === '1787' ? 'is-active' : ''}`} onClick={() => setYear('1787')}>
          1787
        </button>
        <button className={`Button ${year === '1789' ? 'is-active' : ''}`} onClick={() => setYear('1789')}>
          1789
        </button>
      </div> */}
    </div>
  )
}
import { scaleLinear } from "d3-scale";
import { useMemo } from "react";
import { formatNumber } from "../../utils/misc";



function ColumnsComparison({
  width,
  height,
  title,
  left,
  right,
  style = {},
  data: inputData,
}) {
  const {
    title: leftTitle,
    items: leftItems
  } = left;
  const {
    title: rightTitle,
    items: rightItems
  } = right;


  const margins = {
    top: 40,
    bottom: 40,
    left: 20,
    right: 20
  }


  const { vizLeftItems, vizRightItems } = useMemo(() => {
    const dataDict = inputData.reduce((res, { label, type, valeur }) => ({
      ...res,
      [label]: +valeur
    }), {})

    const sums = [
      leftItems.reduce((sum, { field }) => sum + (dataDict[field] || 0), 0),
      rightItems.filter(d => !d.isSource).reduce((sum, { field }) => sum + (dataDict[field] || 0), 0),
    ];
    const diff = Math.abs(sums[1] - sums[0]);
    dataDict['diff'] = diff;
    let finalLeftItems = leftItems;
    let finalRightItems = rightItems;
    if (sums[0] < sums[1]) {
      finalLeftItems = [...leftItems, {field: 'diff', title: 'différentiel entre imports et exports'}]
    } else {
      finalRightItems = [...rightItems, {field: 'diff', title: 'différentiel entre imports et exports'}]
    }
    
    const max = Math.max(...sums);
    const yScale = scaleLinear().domain([0, max]).range([0, height - margins.top * 2.5 - margins.bottom])
    return {
      vizLeftItems: finalLeftItems.reduce(({ displace, displaceSource, items }, { field, title: itemTitle, isSource }) => {
        const finalTitle = itemTitle || field;
        const height = yScale(dataDict[field] || 0);
        if (isSource || field === 'diff') {
          displaceSource += height;
        } else {
          displace += height;
        }
        const y = isSource || field === 'diff' ? displaceSource - height : displace - height;
        return {
          items: [...items, {
            title: finalTitle,
            y,
            height,
            value: dataDict[field] || 0,
            type: isSource ? 'source' : field === 'diff' ? 'diff' : 'estimation',
            isSource,
          }],
          displace,
          displaceSource,
        }
      }, { displace: 0, displaceSource: 0, items: [] }).items,
      vizRightItems: finalRightItems.reduce(({ displace, displaceSource, items }, { field, title: itemTitle, isSource }) => {
        const finalTitle = itemTitle || field;
        const height = yScale(dataDict[field] || 0);
        if (isSource) {
          displaceSource += height;
        } else {
          displace += height;
        }
        const y = isSource ? displaceSource - height : displace - height;
        
        return {
          items: [...items, {
            title: finalTitle,
            y,
            height,
            value: dataDict[field] || 0,
            type: isSource ? 'source' : field === 'diff' ? 'diff' : 'estimation',
            isSource,
          }],
          displace,
          displaceSource,
        }
      }, { displace: 0, displaceSource: 0, items: [] }).items,
    }
  }, [leftItems, rightItems, inputData]);

  const minLabelHeight = 50;
  return (
    <svg
      style={style}
      width={width}
      height={height}
      className="ColumnsComparison"
    >
      {/* <rect x={0} y={0} width={width} height={height} fill="white" /> */}
      <foreignObject
        x={margins.left}
        y={margins.top / 2}
        width={width}
        height={margins.top}
      >
        <h2>
          {title}
        </h2>
      </foreignObject>
      <g className="group left-group" transform={`translate(${margins.left}, ${margins.top})`}>
        <foreignObject
          x={0}
          y={margins.top / 2}
          width={width / 2 - margins.right * 2}
          height={margins.top}
        >
          <h3>
            {leftTitle}
          </h3>
        </foreignObject>
        {
          vizLeftItems.map(({ title, y, height, value, type }) => {
            const textHeight = Math.max(height, minLabelHeight);
            return (
              <g key={title}
                className={`quantity-group ${type}`}
                transform={`translate(${0}, ${margins.top * 1.5 + y})`}
              >
                <rect
                  x={width / 2 - margins.right * 2 - 10}
                  y={0}
                  width={10}
                  height={height}
                />
               <foreignObject
                  x={20}
                  y={0}
                  width={width / 2 - margins.right * 2 - 40}
                  height={textHeight}
                >
                  <div className={`label-container ${height < minLabelHeight ? 'is-overflowing' : ''}`}>
                  <p>
                      {title} <i>({formatNumber(parseInt(value))} lt.)</i>
                    </p>
                  </div>
                  
                </foreignObject>
              </g>
            )
          })
        }
      </g>
      <g className="group right-group" transform={`translate(${margins.left + width / 2}, ${margins.top})`}>
        <foreignObject
          x={0}
          y={margins.top / 2}
          width={width / 2 - margins.right}
          height={margins.top}
        >
          <h3 style={{ margin: 0 }}>
            {rightTitle}
          </h3>
        </foreignObject>
        {
          vizRightItems.map(({ title, y, height, value, isSource, type }) => {
            const textHeight = Math.max(height, minLabelHeight)
            return (
              <g key={title}
                className={`quantity-group ${type}`}
                transform={`translate(${isSource ? 20 : 0}, ${margins.top * 1.5 + y})`}
              >
                <rect
                  x={0}
                  y={0}
                  width={10}
                  height={height}
                />
                <foreignObject
                  x={20}
                  y={0}
                  width={width / 2 - margins.right - (isSource ? 40 : 20)}
                  height={textHeight}
                >
                  <div className={`label-container ${height < minLabelHeight ? 'is-overflowing' : ''}`}>
                  <p >
                      {title} <i>({formatNumber(parseInt(value))} lt.)</i>
                    </p>
                  </div>
                  
                </foreignObject>
              </g>
            )
          })
        }
      </g>
      <g className="legend" transform={`translate(${margins.left}, ${height - margins.bottom - 120})`}>
        {
          [
            {
              color: 'red',
              label: 'Sources'
            },
            {
              color: 'blue',
              label: 'Projections'
            },
            {
              color: 'grey',
              label: 'Différentiels entre sources et projections'
            },
          ]
          .map(({color, label}, index) => {
            return (
              <g 
                className={'legend-item'}
                key={index}
                transform={`translate(0, ${index * 20})`}
              >
                <rect
                  x={0}
                  y={5}
                  width={10}
                  height={10}
                  fill={color}
                  stroke='none'
                />
                <foreignObject
                  x={20}
                  y={0}
                  width={width / 2 - margins.left * 2 - margins.right}
                  height={width / 2}
                >
                  <div>
                    {label}
                  </div>
                  
                </foreignObject>
              </g>
            )
          })
        }
      </g>
    </svg>
  )
}

export default ColumnsComparison;
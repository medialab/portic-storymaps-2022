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

  const dataDict = useMemo(() =>
    inputData.reduce((res, { label, type, valeur }) => ({
      ...res,
      [label]: +valeur
    }), {})
    , [inputData]);

  const margins = {
    top: 40,
    bottom: 40,
    left: 20,
    right: 20
  }


  const yScale = useMemo(() => {
    const sums = [
      leftItems.reduce((sum, { field }) => sum + (dataDict[field] || 0), 0),
      rightItems.reduce((sum, { field }) => sum + (dataDict[field] || 0), 0),
    ];
    const max = Math.max(...sums);
    return scaleLinear().domain([0, max]).range([0, height - margins.top * 2.5 - margins.bottom])
  }, [dataDict, leftItems, rightItems]);

  const { vizLeftItems, vizRightItems } = useMemo(() => {
    return {
      vizLeftItems: leftItems.reduce(({ displace, items }, { field, title }) => {
        const finalTitle = title || field;
        const height = yScale(dataDict[field] || 0);
        displace += height;
        return {
          items: [...items, {
            title: finalTitle,
            y: displace - height,
            height,
            value: dataDict[field] || 0
          }],
          displace
        }
      }, { displace: 0, items: [] }).items,
      vizRightItems: rightItems.reduce(({ displace, items }, { field, title }) => {
        const finalTitle = title || field;
        const height = yScale(dataDict[field] || 0);
        displace += height;
        return {
          items: [...items, {
            title: finalTitle,
            y: displace - height,
            height,
            value: dataDict[field] || 0
          }],
          displace
        }
      }, { displace: 0, items: [] }).items,
    }
  }, [dataDict, leftItems, rightItems, yScale]);
  return (
    <svg
      style={style}
      width={width}
      height={height}
    >
      <rect x={0} y={0} width={width} height={height} fill="white" />
      <foreignObject
        x={margins.left}
        y={margins.top / 2}
        width={width}
        height={margins.top}
      >
        <h2 style={{ margin: 0 }}>
          {title}
        </h2>
      </foreignObject>
      <g className="group left-group" transform={`translate(${margins.left}, ${margins.top})`}>
        <foreignObject
          x={0}
          y={margins.top / 2}
          width={width / 2 - margins.right}
          height={margins.top}
        >
          <h3 style={{ margin: 0 }}>
            {leftTitle}
          </h3>
        </foreignObject>
        {
          vizLeftItems.map(({ title, y, height, value }) => {
            return (
              <g key={title}
                className="quantity-group"
                transform={`translate(${0}, ${margins.top * 1.5 + y})`}
              >
                <rect
                  x={width / 2 - 30}
                  y={0}
                  width={10}
                  height={height}
                  stroke={'blue'}
                  fill={'none'}
                />
               <foreignObject
                  x={20}
                  y={0}
                  width={width / 2 - margins.right - 40}
                  height={Math.max(height, 60)}
                >
                  <div style={{height: '100%', display: 'flex', alignItems: 'center'}}>
                  <p style={{ margin: 0, textAlign: 'right', color: 'blue' }}>
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
          vizRightItems.map(({ title, y, height, value }) => {
            return (
              <g key={title}
                className="quantity-group"
                transform={`translate(${0}, ${margins.top * 1.5 + y})`}
              >
                <rect
                  x={0}
                  y={0}
                  width={10}
                  height={height}
                  stroke={'red'}
                  fill={'none'}
                />
                <foreignObject
                  x={20}
                  y={0}
                  width={width / 2 - margins.right - 20}
                  height={Math.max(height, 40)}
                >
                  <div style={{height: '100%', display: 'flex', alignItems: 'center'}}>
                  <p style={{ margin: 0 }}>
                      {title} <i>({formatNumber(parseInt(value))} lt.)</i>
                    </p>
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
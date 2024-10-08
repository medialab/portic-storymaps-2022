import { scaleLinear } from "d3-scale";
import { useMemo } from "react";
import { formatNumber } from "../../utils/misc";

import translate from "../../utils/translate";

function ColumnsComparison({
  width,
  height,
  title,
  left,
  right,
  style = {},
  data: inputData,
  lang,
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
    bottom: 0,
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
      rightItems.filter(d => !d.isSource || d.isCounted).reduce((sum, { field }) => sum + (dataDict[field] || 0), 0),
    ];
    const diff = Math.abs(sums[1] - sums[0]);
    dataDict['diff'] = diff;
    let finalLeftItems = leftItems;
    let finalRightItems = rightItems;
    if (sums[0] < sums[1]) {
      finalLeftItems = [...leftItems, { 
        field: 'diff', 
        title: translate('EstimationImportsExports', 'differential_imports_exports', lang)
      }]
    } else {
      finalRightItems = [...rightItems, { 
        field: 'diff', 
        title: translate('EstimationImportsExports', 'differential_imports_exports', lang)
      }]
    }

    const max = Math.max(...sums);
    const yScale = scaleLinear().domain([0, max]).range([0, height - margins.top * 2.5 - margins.bottom])
    return {
      vizLeftItems: finalLeftItems.reduce(({ displace, displaceSource, items }, { field, title: itemTitle, isSource, isCounted, displaceValue = 0 }) => {
        const finalTitle = itemTitle || field;
        const height = yScale(dataDict[field] || 0);
        if (displaceValue) {
          const displaceRel = yScale(displaceValue);
          if ((isSource && !isCounted) || field === 'diff') {
            displaceSource += displaceRel;
          } else {
            displace += displaceRel;
          }
        }
        if ((isSource && !isCounted) || field === 'diff') {
          displaceSource += height;
        } else {
          displace += height;
        }
        const y = (isSource && !isCounted) || field === 'diff' ? displaceSource - height : displace - height;
        return {
          items: [...items, {
            title: finalTitle,
            y,
            height,
            value: dataDict[field] || 0,
            type: isSource ? 'source' : field === 'diff' ? 'diff' : 'estimation',
            isSource,
            isCounted,
          }],
          displace,
          displaceSource,
        }
      }, { displace: 0, displaceSource: 0, items: [] }).items,
      vizRightItems: finalRightItems.reduce(({ displace, displaceSource, items }, { field, title: itemTitle, isSource, isCounted, displaceValue = 0}) => {
        const finalTitle = itemTitle || field;
        const height = yScale(dataDict[field] || 0);
        if (displaceValue) {
          const displaceRel = yScale(displaceValue);
          if ((isSource && !isCounted) || field === 'diff') {
            displaceSource += displaceRel;
          } else {
            displace += displaceRel;
          }
        }
        if (isSource && !isCounted) {
          displaceSource += height;
        } else {
          displace += height;
        }
        const y = (isSource && !isCounted) ? displaceSource - height : displace - height;

        return {
          items: [...items, {
            title: finalTitle,
            y,
            height,
            value: dataDict[field] || 0,
            type: isSource ? 'source' : field === 'diff' ? 'diff' : 'estimation',
            isSource,
            isCounted,
          }],
          displace,
          displaceSource,
        }
      }, { displace: 0, displaceSource: 0, items: [] }).items,
    }
  }, [leftItems, rightItems, inputData, lang, translate]);

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
      <rect
          x={-margins.left / 2}
          y={margins.top / 2}
          width={width / 2 - margins.right + margins.left / 2 - 10}
          height={height - margins.top * 1.5 - margins.bottom}
          fill={'rgba(0,0,0,0.05)'}
        />
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
                  <div className={`label-container ${type === 'diff' ? 'align-top' : ''} ${height < minLabelHeight ? 'is-overflowing' : ''}`}>
                    <p>
                      {title} <i>({formatNumber(parseInt(value), lang)} lt.)</i>
                    </p>
                  </div>

                </foreignObject>
              </g>
            )
          })
        }
      </g>
      <g className="group right-group" transform={`translate(${margins.left + width / 2}, ${margins.top})`}>
        <rect
          x={-margins.left / 2}
          y={margins.top / 2}
          width={width / 2 - margins.right + margins.left / 2}
          height={height - margins.top * 1.5 - margins.bottom}
          fill={'rgba(0,0,0,0.1)'}
        />
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
          vizRightItems.map(({ title, y, height, value, isSource, isCounted, type }, index) => {
            const textHeight = Math.max(height, minLabelHeight)
            return (
              <g key={title}
                className={`quantity-group ${type}`}
                transform={`translate(${isSource && !isCounted ? 20 : 0}, ${margins.top * 1.5 + y})`}
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
                  width={width / 2 - margins.right - 10 - (isSource ? 40 : 20)}
                  height={textHeight}
                >
                  <div className={`label-container ${type === 'estimation' && index !== vizRightItems.length - 1 ? 'align-bottom' : ''} ${height < minLabelHeight ? 'is-overflowing' : ''}`}>
                    <p >
                      {title} <i>({formatNumber(parseInt(value), lang)} lt.)</i>
                    </p>
                  </div>

                </foreignObject>
              </g>
            )
          })
        }
      </g>
      <g className="legend" transform={`translate(${margins.left * 1.5}, ${height - margins.bottom - 120})`}>
        <rect
          x={-10}
          y={-10}
          width={width / 2 - margins.left * 2 - margins.right}
          height={height - (height - margins.bottom - 100)}
          fill={'white'}
          stroke='none'
        />
        {
          [
            {
              color: '#e93d15',
              label: translate('EstimationImportsExports', 'legend_sources', lang)
            },
            {
              color: '#514EEE',
              label: translate('EstimationImportsExports', 'legend_projections', lang)
            },
            {
              color: '#34495e',
              label: translate('EstimationImportsExports', 'legend_differential', lang)
            },
          ]
            .map(({ color, label }, index) => {
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
                    width={width / 2 - margins.left * 2 - margins.right * 3}
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
import { extent, max, range } from "d3-array";
import { scaleLinear } from "d3-scale";
import { formatNumber } from "../../utils/misc";


const MiniLinechart = ({
  data: inputData,
  width = 200,
  height = 100,
  x,
  y,
}) => {
  const data = inputData.map(d => ({ ...d, [y.field]: +(d[y.field].replace(/\s/, '').split(',').slice(0, 1)) }));
  const margin = 10;
  const xAxisWidth = 70;
  const yAxisHeight = 30;
  const xExtent = extent(data.map(d => +d[x.field]));
  // const yExtent = extent(data.map(d => +d[y.field]));
  const xScale = scaleLinear().domain(xExtent).range([xAxisWidth, width - xAxisWidth]);
  const yScale = scaleLinear()
  // .domain([0, 100])
  .domain([0, max(data.map(d => +d[y.field]))])
  .range([height - yAxisHeight - margin, margin]).nice();
  const xAxisValues = range(xExtent[1] - xExtent[0] + 1).map(y => y + xExtent[0]).filter(y => y % 2 === 0);
  let radius = width / 200;
  radius = radius < 3 ? 3 : radius;
  return (
    <svg {
      ...{
        width,
        height
      }
    }
      style={{
        minHeight: height
      }}
    >
      <g className="axis y-axis">
        <line
          x1={xAxisWidth}
          x2={xAxisWidth}
          y1={margin}
          y2={height - yAxisHeight - margin}
          stroke="black"
        />
        {
          // range(11).map(n => n * 10)
          range(6).map(n => n * 40000)
            .map(pct => {
              const yPos = yScale(pct);
              return (
                <g key={pct} transform={`translate(0, ${yPos})`}>
                  <text
                    x={xAxisWidth - 7}
                    y={3}
                    fontSize={8}
                    textAnchor={'end'}
                  >
                    {formatNumber(pct)} lt.
                  </text>
                  <line
                    x1={xAxisWidth - 5}
                    x2={width - xAxisWidth}
                    y1={0}
                    y2={0}
                    stroke="grey"
                    strokeDasharray={'5, 2'}
                  />
                </g>
              )
            })
        }
      </g>

      <g className="axis x-axis">
        <line
          x1={xAxisWidth}
          x2={width - xAxisWidth}
          y1={height - yAxisHeight - margin}
          y2={height - yAxisHeight - margin}
          stroke="black"
        />
        {
          xAxisValues
            .map(val => {
              const xPos = xScale(val);
              return (
                <g key={val} transform={`translate(${xPos}, 0)`}>

                  <g
                    transform={`translate(0,${height - yAxisHeight - margin + 10}) rotate(45)`}
                  >

                    <text
                      x={0}
                      y={0}
                      // textAnchor="center"
                      fontSize={10}
                    >
                      {val}
                    </text>
                  </g>

                  <line
                    x1={0}
                    x2={0}
                    y1={margin}
                    y2={height - yAxisHeight - margin + 5}
                    stroke="black"
                    strokeDasharray={'5, 2'}
                  />
                </g>
              )
            })
        }
      </g>
      {
        data.map((datum, index) => {
          const next = index < data.length ? data[index - 1] : undefined;
          return (
            <g key={index}>
              <circle
                cx={xScale(+datum[x.field])}
                cy={yScale(+datum[y.field])}
                r={radius}
                fill="grey"
                key={`${index}-point`}
              />
              <circle
                cx={xScale(+datum[x.field])}
                cy={yScale(+datum[y.field])}
                r={radius * 3}
                fill="transparent"
                data-for="histoire-dunkerque-tooltip"
                data-tip={`${datum[x.field]} : ${formatNumber(datum[y.field])} lt`}
                key={`${index}-tip`}
              />

              {
                next &&
                <line
                  x1={xScale(+datum[x.field])}
                  y1={yScale(+datum[y.field])}
                  x2={xScale(+next[x.field])}
                  y2={yScale(+next[y.field])}
                  stroke="grey"
                  key={`${index}-line`}
                />
              }
            </g>
          )
        })
      }

    </svg >
  )
}

export default MiniLinechart;
import { scaleLinear } from "d3-scale";
import { sum } from "lodash";
import { useEffect, useMemo, useState } from "react";
import Measure from 'react-measure';
import { AnimatedGroup, AnimatedPath, AnimatedRect, AnimatedText } from "../../components/AnimatedSvgElements";
import colorsPalettes from "../../utils/colorPalettes";

const { generic20colors, importsExports } = colorsPalettes;
const colors = [
  ...generic20colors,
  ...Object.values(importsExports)
]

import './ImportsDunkerqueVsPortsFrancs.scss';
import { formatNumber } from "../../utils/misc";
import ReactTooltip from "react-tooltip";
import translate from "../../utils/translate";

export default function ImportsDunkerqueVsPortsFrancs({
  data,
  width,
  height,
  lang,
  atlasMode,
  callerProps = {},
}) {
  const {
    utilisertotal,
    montrer = 'tous'
  } = callerProps;

  const [useTotal, setUseTotal] = useState(utilisertotal ? true : false);
  const [rightColumnFilter, setRightColumnFilter] = useState(montrer === 'tous' ? undefined : montrer);
  const [highlightedProduct, setHighlightedProduct] = useState();
  const [headerHeight, setHeaderHeight] = useState(50);

  const vizHeight = height - headerHeight;

  useEffect(() => {
    if (utilisertotal) {
      setUseTotal(true);
    } else {
      setUseTotal(false);
    }
  }, [utilisertotal]);
  useEffect(() => {
    if (montrer === 'tous') {
      setRightColumnFilter();
    } else {
      setRightColumnFilter(montrer);
    }
  }, [montrer]);


  const { leftItems, rightItems } = useMemo(() => {
    const computeSums = products => {
      let groups = Object.values(
        products.reduce((productsMap, { product, value, source }) => {
          if (!productsMap[product]) {
            productsMap[product] = {
              product,
              france: 0,
              foreign: 0,
              total: 0
            }
          }
          productsMap[product][source] += parseFloat(value);
          productsMap[product].total += parseFloat(value);
          return productsMap;
        }, {})
      )
        .sort((a, b) => {
          if (a.total > b.total) {
            return -1;
          }
          return 1;
        })
      if (!useTotal) {
        groups = groups.slice(0, 20);
      } else {
        const otherProductsSums = groups.slice(20).reduce((sums, { france, foreign, total }) => ({
          france: sums.france + france,
          foreign: sums.foreign + foreign,
          total: sums.total + total
        }), {
          france: 0,
          foreign: 0,
          total: 0
        })

        groups = [...groups.slice(0, 20), { product: lang === 'fr' ? 'autres' : 'others', ...otherProductsSums }]
      }
      return groups;
    }

    const leftProducts = data.filter(({ port }) => port === 'Dunkerque');
    const rightProducts = data.filter(({ port }) => rightColumnFilter && rightColumnFilter !== translate('ImportsDunkerqueVsPortsFrancs', 'all_other_free_ports', lang) ? port === rightColumnFilter : port !== 'Dunkerque');

    const leftGroups = computeSums(leftProducts);
    const rightGroups = computeSums(rightProducts);
    const leftScale = scaleLinear().domain([0, sum(leftGroups.map(g => parseFloat(g.total)))]).range([0, vizHeight])
    const rightScale = scaleLinear().domain([0, sum(rightGroups.map(g => parseFloat(g.total)))]).range([0, vizHeight])
    let leftDisplace = 0;
    let rightDisplace = 0;
    return {
      leftItems: leftGroups.map(({ product, france, foreign, total }) => {
        return {
          product,
          y: leftDisplace,
          totalValue: total,
          totalHeight: leftScale(total),
          items: [france, foreign].map((value, valIndex) => {
            const type = valIndex === 0 ? 'france' : 'foreign';
            const barHeight = leftScale(parseFloat(value));
            leftDisplace += barHeight;
            return {
              type,
              absVal: parseFloat(value),
              barHeight,
              y: leftDisplace - barHeight,
            }
          })
        }
      }),
      rightItems: rightGroups.map(({ product, france, foreign, total }) => {
        return {
          product,
          y: rightDisplace,
          totalValue: total,
          totalHeight: rightScale(total),
          items: [france, foreign].map((value, valIndex) => {
            const type = valIndex === 0 ? 'france' : 'foreign';
            const barHeight = rightScale(value);
            rightDisplace += barHeight;
            return {
              type,
              absVal: value,
              barHeight,
              y: rightDisplace - barHeight,
            }
          })
        }
      })
    }

  }, [data, useTotal, rightColumnFilter, vizHeight, lang]);
  const links = useMemo(() => {
    return leftItems
      .filter(({ product, y, totalHeight }) => rightItems.find(({ product: rightProduct }) => product === rightProduct) !== undefined)
      .map(({ product, y, totalHeight }) => {
        const { y: rightY, totalHeight: rightTotalHeight } = rightItems.find(({ product: rightProduct }) => product === rightProduct);

        return {
          y1: y + totalHeight / 2,
          y2: rightY + rightTotalHeight / 2,
          product,
        }
      })
  }, [leftItems, rightItems]);

  const colorPalette = useMemo(() => {
    const uniqProducts = new Set([...leftItems.map(({ product }) => product), ...rightItems.map(({ product }) => product)]);
    return Array.from(uniqProducts).reduce((m, p, i) => ({
      ...m,
      [p]: ['autres', 'others'].includes(p) ? 'lightgrey' : colors[i]
    }), {})
  }, [leftItems, rightItems])

  const barWidth = 10;
  const vizWidth = width - barWidth * 2;

  const selectFilterItems = [
    {
      label: translate('ImportsDunkerqueVsPortsFrancs', 'all_other_free_ports', lang),
      value: undefined,
    },
    ...['Bayonne', 'Lorient', 'Marseille']
      .map((name) => ({
        label: name,
        value: name
      }))
  ];

  return (
    <div className={`ImportsDunkerqueVsPortsFrancs ${highlightedProduct ? 'has-highlights' : ''}`}>
      <Measure
        bounds
        onResize={contentRect => {
          setHeaderHeight(contentRect.bounds.height)
        }}
      >
        {({ measureRef }) => (
          <div className="ui-row" ref={measureRef} style={{ padding: `0 ${barWidth}px` }}>
            <div className="ui-column">
              <h3>{translate('ImportsDunkerqueVsPortsFrancs', 'title_left', lang)}</h3>
            </div>
            <div className="ui-column">
              <button onClick={() => setUseTotal(!useTotal)} className={useTotal ? 'is-active' : ''}>
              {translate('ImportsDunkerqueVsPortsFrancs', 'toggle_total', lang)}
              </button>
            </div>
            <div className="ui-column">
              <h3><span>{translate('ImportsDunkerqueVsPortsFrancs', 'title_right', lang)} </span>
                <select value={rightColumnFilter} onChange={e => e.target.value === 'tous les autres ports francs' ? setRightColumnFilter() : setRightColumnFilter(e.target.value)}>
                  {
                    selectFilterItems.map(({ label, value }) => (
                      <option key={value} value={value}>{label}</option>
                    ))
                  }
                </select>

              </h3>
            </div>
          </div>
        )}
      </Measure>

      <svg width={vizWidth} height={vizHeight} style={{ padding: `0 ${barWidth}px` }}>
        {
          links.map(({ product, y1, y2 }) => {
            const x1 = barWidth;
            const x2 = vizWidth - barWidth;
            const xMiddle = (x1 + x2) / 2;
            return (
              <AnimatedPath
                key={product}
                d={`
                  M ${x1} ${y1}
                  C ${xMiddle} ${y1}, ${xMiddle} ${y2}, ${x2} ${y2}
                  `}
                className={`link ${highlightedProduct === product ? 'is-highlighted' : ''}`}
              />
            )
          })
        }
        <AnimatedGroup className="column left-column">
          {
            [leftItems, rightItems].map((columnData, columnIndex) => {
              const columnType = columnIndex === 0 ? 'left' : 'right';
              const x = columnType === 'left' ? 0 : vizWidth - barWidth;
              return (
                <AnimatedGroup
                  key={columnType}
                  className={`column ${columnType}`}
                  onMouseLeave={() => {
                    setHighlightedProduct();
                  }}
                >
                  {
                    columnData.map(({ product, totalHeight, y, items, totalValue, }) => {
                      const onHover = () => {
                        setHighlightedProduct(product)
                      }
                      const isHighlighted = highlightedProduct === product;
                      const fontSize = Math.max(totalHeight / 4, 7);
                      return (
                        <AnimatedGroup onMouseEnter={onHover} className={`group ${isHighlighted ? 'is-highlighted' : ''}`} key={product}>
                          {
                            items.map(({ type, barHeight, absVal, y }) => {
                              const color = colorPalette[product];
                              const tooltipLabels = {
                                foreign: {
                                  fr: 'import depuis l\'étranger',
                                  en: 'imports from foreign countries',
                                },
                                france: {
                                  fr: 'import depuis la France',
                                  en: 'imports from France',
                                },

                              }
                              
                              const tooltipText = `${tooltipLabels[type][lang]} : ${formatNumber(parseInt(absVal), lang)} lt. (${translate('AlluvialImportExport', product, lang)})`;
                              return (
                                <AnimatedRect
                                  key={type}
                                  fill={color}
                                  fillOpacity={type === 'france' ? .5 : 1}
                                  stroke="none"
                                  x={x}
                                  width={barWidth}
                                  y={y}
                                  height={type === 'foreign' ? barHeight - 2 : barHeight}
                                  data-tip={tooltipText}
                                  data-for={'pf-tooltip'}
                                />
                              )
                            })
                          }
                          <AnimatedText
                            x={columnType === 'left' ? x + barWidth * 2 : x - barWidth}
                            y={y + totalHeight / 2}
                            textAnchor={columnType === 'left' ? 'start' : 'end'}
                            fontSize={fontSize}
                          >
                            {translate('AlluvialImportExport', product, lang)}
                          </AnimatedText>
                          {
                            totalHeight > 10 ?
                              <AnimatedText
                                x={columnType === 'left' ? x + barWidth * 2 : x - barWidth}
                                y={y + totalHeight / 2 + fontSize * .9}
                                textAnchor={columnType === 'left' ? 'start' : 'end'}
                                fontSize={fontSize * .6}
                                fontStyle={'italic'}
                              >
                                {formatNumber(parseInt(totalValue), lang)} lt.
                              </AnimatedText>
                              : null
                          }

                        </AnimatedGroup>
                      )
                    })
                  }
                </AnimatedGroup>
              )
            })

          }
        </AnimatedGroup>
      </svg>
      <ReactTooltip id="pf-tooltip" />
    </div>
  )
}
import React, { useMemo, useReducer, useState } from "react";

import { scaleLinear } from "d3-scale";
import { groups, max, sum } from 'd3-array'
import { formatNumber, partialCirclePathD } from "../../utils/misc";
import iwanthue from 'iwanthue';

// import { path, g, rect } from '../AnimatedSvgElements';

import './AlluvialImportExport.scss';

function pickTextColor(bgColor, lightColor = 'white', darkColor = 'black') {
  const color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16); // hexToR
  const g = parseInt(color.substring(2, 4), 16); // hexToG
  const b = parseInt(color.substring(4, 6), 16); // hexToB
  const uicolors = [r / 255, g / 255, b / 255];
  const c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  const L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
  return (L > 0.179) ? darkColor : lightColor;
}


/**
 * @typedef Line
 * @type {object}
 * @property {'Exports' | 'Imports'} importsexports
 * @property {String} port
 * @property {'detail_products'} aggregate_type
 * @property {'Monde' | 'Colonies' | 'Fraude'} partner_type
 * @property {String} product_type
 * @property {Number} value
 */

/**
 * @param {Object} props
 * @param {Line[]} props.data
 * @param {Object} props.dimensions
 * @param {Number} props.dimensions.width
 * @param {Number} props.dimensions.height
 * @param {Object} props.colorPalette
 * @returns {React.ReactElement}
 */

export default function AlluvialImportExport({
  data: inputData,
  dimensions,
  colorPalette = {},
  atlasMode,
  notDunkerque,
  hideArrows = false,
  ...props
}) {
  const [highlightedItem, setHighlightedItem] = useState();
  // const [focus, setFocus] = useReducer((currentState, action) => {
  //   let { actionType, itemType, itemValue, mode } = action;
  //   if (currentState && itemValue === currentState.itemValue) { actionType = 'reset' }
  //   switch (actionType) {
  //     case 'set':
  //       return {
  //         itemType,
  //         itemValue,
  //         mode
  //       }
  //     case 'reset':
  //       return undefined;
  //   }
  // }, undefined);

  const { width, height } = dimensions;
  const barWidth = 70;

  function sortEntriesByValue([aName, aValue], [bName, bValue]) {
    if (aName === '' && bName !== '') {
      return 1;
    } else if (aName !== '' && bName === '') {
      return -1;
    }
    if (aValue < bValue) { return -1; }
    if (aValue > bValue) { return 1; }
    return 0;
  }

  const data = useMemo(() => {
    // sort to get 'fraude' partner type on top of alluvial
    return inputData.sort(({ partner_type: aPartner }) => {
      if (aPartner === 'Fraude') { return -1; }
      if (aPartner !== 'Fraude') { return 1; }
      return 0;
    })
  }, [inputData, focus])

  const products = useMemo(function groupProducts() {
    return groups(data, d => d.product_type);
  }, [data]);

  const partners = useMemo(function groupPartners() {
    return groups(data, d => d.partner_type);
  }, [data]);

  const {
    productBarHeight,
    partnerBarHeight,
    centerCircleHeight,
    scaleValue,
    productsImportValue,
    partnersMaxValue,
    sumFraudeImports,
    sumFraudeExports
  } = useMemo(function getHeightForDraw() {
    /**
     * To size product bar,
     * need for each product the max value between imports and exports
     */
    let productsImportValue = products.map(([product, productArray]) => {
      const productImportArray = [];
      const productExportArray = [];
      for (const item of productArray) {
        switch (item['importsexports']) {
          case 'Imports':
            productImportArray.push(item); continue;
          case 'Exports':
            productExportArray.push(item); continue;
        }
      }
      const productImportTotal = sum(productImportArray, d => d.value);
      const productExportTotal = sum(productExportArray, d => d.value);
      return [
        product,
        max([productImportTotal, productExportTotal])
      ];
    });
    /**
     * Isolate fraude imports and exports
     */
    const fraudeImports = products.reduce((res, p) => [...res, ...p[1].filter(p => p['importsexports'] === 'Imports' && (p.partner_type === 'Fraude'))], []);
    const fraudeExports = products.reduce((res, p) => [...res, ...p[1].filter(p => p['importsexports'] === 'Exports' && (p.partner_type === 'Fraude'))], []);
    const sumFraudeImports = sum(
      fraudeImports
    , d => d.value);
    let sumFraudeExports = sum(
      fraudeExports
    , d => d.value);

    // console.log({
    //   sumFraudeImports, 
    //   sumFraudeExports,
    //   fraudeImports,
    //   fraudeExports,
    // })

    const globalImport = productsImportValue.find(d => d[0] === '');
    const sumOfImports = sum(productsImportValue.filter(d => d[0] !== ''), d => d[1]);
   
    const productsTotalImportValue = globalImport && globalImport[1] > sumOfImports ? globalImport[1] : sum(productsImportValue, d => d[1]);
    // console.log('comparison', {global: formatNumber(globalImport[1]), sum: formatNumber(sum(productsImportValue.filter(d => d[0] !== ''), d => d[1]))})
    if (globalImport && globalImport[1] > sumOfImports) {
      sumFraudeExports = globalImport[1] - sum(products.reduce((res, p) => [...res, ...p[1].filter(p => p['importsexports'] === 'Exports')], []).map(d => d.value));
    }
    productsImportValue = Object.fromEntries(productsImportValue);
    /**
     * To size partner bar,
     * need for each partner the max value between imports and exports
     */
    let partnersMaxValue = partners.map(([partner, partnerArray]) => {
      if (partner === 'Fraude') { 
        return [partner, 0]; 
      }
      let partnerImportArray = [];
      let partnerExportArray = [];
      for (const { importsexports, value } of partnerArray) {
        switch (importsexports) {
          case 'Imports': partnerImportArray.push(value); continue;
          case 'Exports': partnerExportArray.push(value); continue;
        }
      }
      return [
        partner,
        max([
          sum(partnerImportArray),
          sum(partnerExportArray)
        ])
      ]
    });
    const partnerTotalValue = sum(partnersMaxValue, d => d[1]);
    partnersMaxValue = Object.fromEntries(partnersMaxValue);

    // const importGap = globalImport ? globalImport[1] - sum(Object.entries(productsImportValue).filter(d => d[0] !== '').map(d => d[1])) : 0;
    /**
     * Size of the center loop draw
     */
    const centerCircleHeight = 50;
    const scaleValue = scaleLinear()
      .domain([0, sum([productsTotalImportValue, partnerTotalValue])])
      // .domain([0, sum([productsTotalImportValue, partnerTotalValue])])
      .range([0, height - centerCircleHeight]);

      // console.log({
      //     productBarHeight: scaleValue(productsTotalImportValue),
      //     productBarHeightBis: scaleValue(productsTotalImportValue),
      //     importGap: scaleValue(-importGap),
      //     partnerBarHeight: scaleValue(partnerTotalValue),
      // })
    return {
      productBarHeight: scaleValue(productsTotalImportValue),
      partnerBarHeight: scaleValue(partnerTotalValue),
      centerCircleHeight,
      scaleValue,
      productsImportValue,
      partnersMaxValue,
      sumFraudeImports,
      sumFraudeExports,
    }
  }, [height, products, partners]);
  /**
   * We sum the value, item by item, to increment the value and deduce the 'y'
   * position of product/partners.
   */

  const {
    visProducts, // each product with its initial value, sum with previous elements, ready to be scaled on pixels ('y' position)
    visPartners,
    links // each data line, refactor as a directionnal link, 'from' -> 'to
  } = useMemo(function positionElements() {
    let productsImportSorted = Object.entries(productsImportValue).sort(sortEntriesByValue);
    const visProducts = [];
    const visProductsMap = {};
    let globalImport = productsImportSorted.find(d => d[0] === '');
    globalImport = globalImport && globalImport[1];
    if (globalImport) {
      visProductsMap[''] = 0;
    }
    const sumOfImports = sum(productsImportSorted.filter(d => d[0] !== ''), d => d[1]);
    const importGap = (globalImport && globalImport > sumOfImports ? globalImport : sumOfImports) - sum(productsImportSorted.filter(d => d[0] !== '').map(d => d[1]));// : 0;
    productsImportSorted = importGap ? [['Fraude', importGap], ...productsImportSorted.filter(d => d[0] !== "")] : productsImportSorted;
    let displacement = 0;
    for (const [product, value] of productsImportSorted) {
      if (product === '') {
        continue;
      }
      console.log({
        displacement,
        value,
        y: scaleValue(displacement),
        product,
      })
      const item = {
        product,
        barHeight: scaleValue(Math.abs(value)),
        y: scaleValue(displacement),
      };
      visProducts.push(item);
      visProductsMap[product] = item.y;
      displacement += Math.abs(value);
    }

    const partnersMaxSorted = Object.entries(partnersMaxValue).sort(sortEntriesByValue);
    const visPartners = [];
    const visPartnersMap = {};
    displacement = 0;
    for (const [partner, value] of partnersMaxSorted) {
      if (partner === '') {
        break;
      }
      const item = {
        partner,
        barHeight: scaleValue(value),
        y: scaleValue(displacement),
      }
      visPartners.push(item);
      visPartnersMap[partner] = item.y;
      displacement += value;
    }
    let usableProducts = products;
    if (globalImport && importGap) {
      usableProducts = [...products, 
        [
          'Fraude',
          [{
            aggregate_type: '',
            importsexports: 'Exports',
            partner_type: 'bureau des fermes de Dunkerque',
            port: '',
            product_type: '',
            value: importGap
          }]
        ]
      ]
    }

    const displacementsMaps = {
      'Imports': {},
      'Exports': {}
    }
    // console.log('usableProducts', usableProducts);
    let { importsLinks, exportsLinks } = usableProducts
      .sort((a, b) => {
        if (visProductsMap[a[0]] > visProductsMap[b[0]]) {
          return -1;
        }
        return 1;
      })
      .reduce((res, [product, flows]) => {
        return flows.filter(f => f)
          .sort((a, b) => {
            // if (a.importexports === b.importexports && a.partner_type && 'Fraude' && b.partner_type !== 'Fraude') {
            //   return -1;
            // }
            // else 
            if (a.partner_type === 'Fraude') {
              return -1;
            } else if (product === '') {
              return -1;
            }
            else if (visPartnersMap[a.partner_type] > visPartnersMap[b.partner_type]) {
              return -1;
            }
            return 1;
          })
          .reduce((res2, { value, partner_type, importsexports }) => {
 
            const yProduct = visProductsMap[product];
            const yPartner = visPartnersMap[partner_type];
            const strokeWidth = scaleValue(value)
            if (displacementsMaps[importsexports][partner_type] === undefined) {
              displacementsMaps[importsexports][partner_type] = 0;
            }
            if (displacementsMaps[importsexports][product] === undefined) {
              displacementsMaps[importsexports][product] = 0;
            }
            const isFraude = partner_type === 'Fraude' || product === 'Fraude';
            const arrKey = importsexports === 'Exports' ? 'exportsLinks' : 'importsLinks';
            const fromKey = importsexports === 'Exports' ? partner_type : product;
            const toKey = importsexports === 'Exports' ? product : partner_type;
            const fromY = importsexports === 'Imports' ? yPartner + displacementsMaps[importsexports][partner_type] : yProduct + displacementsMaps[importsexports][product];
            const toY = importsexports === 'Imports' ? yProduct + displacementsMaps[importsexports][product] : yPartner + + displacementsMaps[importsexports][partner_type];
            displacementsMaps[importsexports][partner_type] += strokeWidth;
            displacementsMaps[importsexports][product] += strokeWidth;
            return {
              ...res2,
              [arrKey]: [
                ...res2[arrKey],
                {
                  value,
                  strokeWidth,
                  product,
                  isFraude,
                  type: importsexports,
                  from: {
                    key: fromKey,
                    y: fromY
                  },
                  to: {
                    key: toKey,
                    y: toY
                  }
                }
              ]
            }
          }, res)
      }, {
        importsLinks: [],
        exportsLinks: []
      });

    return {
      links: {
        'Imports': importsLinks,
        'Exports': exportsLinks,
      },
      visProducts,
      visPartners
    };
  }, [products, partners, scaleValue]);

  const labelMargin = 2;
  const arrowSize = 20;
  return (
    <svg
      {...{
        width,
        height
      }}
      className={`AlluvialImportExport ${atlasMode ? 'atlas-mode': ''} ${highlightedItem ? 'has-highlights' : ''}`}

    >

      <rect
        x={width / 2 - barWidth / 2}
        y={0}
        width={barWidth}
        height={productBarHeight}
        fill='lightgrey'
      />
      <rect
        x={width / 2 - barWidth / 2}
        y={productBarHeight + centerCircleHeight}
        width={barWidth}
        height={partnerBarHeight}
        fill='grey'
      />
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill='transparent'
        onMouseOver={() => setHighlightedItem()}

      // onMouseMove={() => {
      //   if (focus) {
      //     setFocus({ actionType: 'reset' })
      //   }
      // }}
      />
      <defs>
        <marker id='arrow-head' orient='auto' markerWidth='10' markerHeight='6' refX='0.1' refY='2'>
          <path d='M0,0 V4 L2,2 Z' fill='black' />
        </marker>
        <marker id='arrow-head-white' orient='auto' markerWidth={arrowSize} markerHeight='12' refX='0.1' refY='4'>
          <path d='M0,0 V8 L4,4 Z' fill='black' />
        </marker>
      </defs>
      <g
        className="product-bar"
        transform={`translate(${width / 2 - barWidth / 2}, ${0})`}
      >
        {
          visProducts.map(({ product, barHeight, y }, i) => {
            // @todo improve resilience of the following
            const labelNbLines = product.length > 10 ? 2 : 1;
            const color = colorPalette[product] || iwanthue(1, { seed: product })[0];
            const isTooSmallForText = barHeight < 25;
            let isHighlighted = false;
            if (highlightedItem) {
              if (highlightedItem.type === 'product' && highlightedItem.value === product) {
                isHighlighted = true;
              } else if (highlightedItem.type === 'link' && highlightedItem.value.includes(product)) {
                isHighlighted = true;
              }
            }
            return (
              <g
                transform={`translate(${0}, ${y})`}
                onMouseOver={() => setHighlightedItem({ type: 'product', value: product })}
                key={i}
                className={`modality-group ${isHighlighted ? 'is-highlighted' : ''} ${isTooSmallForText ? 'is-overflowing' : ''}`}
              >
                <rect
                  x={1}
                  y={0}
                  width={barWidth - 2}
                  height={barHeight - 1}
                  fill={color}
                  className="modality-rect"
                />
                <foreignObject
                  x={0}
                  y={barHeight / 2 - labelNbLines * 5 - 5}
                  width={barWidth}
                  height={barHeight * 2}
                >
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    className="modality-label"
                    style={{
                      color: pickTextColor(color)
                    }}
                  >{product}</div>
                </foreignObject>
              </g>
            )
          })
        }
      </g>
      <g
        className="partner-bar"
        transform={`translate(${width / 2 - barWidth / 2}, ${productBarHeight + centerCircleHeight})`}
      >
        {
          visPartners.map(({ partner, barHeight, y }, i) => {
            const color = colorPalette[partner] || iwanthue(1, { seed: partner })[0];
            const isTooSmallForText = barHeight < 25;
            let isHighlighted = false;
            const labelNbLines = partner.length > 10 ? 2 : 1;
            if (highlightedItem) {
              if (highlightedItem.type === 'partner' && highlightedItem.value === partner) {
                isHighlighted = true;
              } else if (highlightedItem.type === 'link' && highlightedItem.value.includes(partner)) {
                isHighlighted = true;
              }
            }
            return (
              <g
                transform={`translate(${0}, ${y})`}
                onMouseOver={() => setHighlightedItem({ type: 'partner', value: partner })}
                key={i}
                className={`modality-group ${isHighlighted ? 'is-highlighted' : ''} ${isTooSmallForText ? 'is-overflowing' : ''}`}
              >
                <rect
                  x={1}
                  y={0}
                  width={barWidth - 2}
                  height={barHeight - 1}
                  fill={color}
                  className="modality-rect"
                />
                {
                  partner !== 'Fraude' &&
                  <foreignObject
                    x={0}
                    y={barHeight / 2 - labelNbLines * 5 - 5}
                    width={barWidth}
                    height={barHeight}
                  >
                    <div
                      xmlns="http://www.w3.org/1999/xhtml"
                      className="modality-label"
                      style={{
                        color: pickTextColor(color)
                      }}
                    >{partner}</div>
                  </foreignObject>
                  // <text
                  //   y={barHeight / 2 - labelMargin}
                  //   x={barWidth / 2}
                  //   className="modality-label"
                  // >
                  //   {partner}
                  // </text>
                }
              </g>
            )
          })
        }
      </g>
      <g>
        {
          Object.entries(links)
            .map(([linkType, theseLinks]) => {
              return (
                <g key={linkType} id={linkType}>
                  {
                    theseLinks
                      // .sort((a, b) => {
                      //   const [aRadius, bRadius] = [a, b].map(({ linkType, from, to }) => {
                      //     const startY = linkType === 'Imports' ? productBarHeight + centerCircleHeight + from.y : from.y;
                      //     const endY = linkType === 'Imports' ? to.y : productBarHeight + centerCircleHeight + to.y;
                      //     const radius = Math.abs(endY - startY) / 2;
                      //     return radius;
                      //   })
                      //   let operator
                      //   if (aRadius > bRadius) {
                      //     operator = -1;
                      //   } else {
                      //     operator = -1;
                      //   }
                      //   return operator;
                      // })
                      .map(({ from, to, value, strokeWidth, product, isFraude }, i) => {
                        const color = colorPalette[product] || iwanthue(1, { seed: product });
                        const startY = linkType === 'Imports' ? productBarHeight + centerCircleHeight + from.y : from.y;
                        const endY = linkType === 'Imports' ? to.y : productBarHeight + centerCircleHeight + to.y;
                        const radius = Math.abs(endY - startY) / 2;
                        const centerY = linkType === 'Imports' ? endY + radius : startY + radius;
                        // const strokeWidth = scaleValue(value);
                        // const strokeWidthMiddle = strokeWidth / 2;
                        const isTooSmallForText = strokeWidth < 15;
                        let isHighlighted = false;
                        if (highlightedItem) {
                          if (highlightedItem.type === 'link' && highlightedItem.value.join('|') === [from.key, to.key].join('|')) {
                            isHighlighted = true;
                          } else if ([from.key, to.key].includes(highlightedItem.value)) {
                            isHighlighted = true;
                          }
                        }
                        return (
                          <g
                            transform={`translate(${linkType === 'Imports' ? width / 2 - barWidth / 2 : width / 2 + barWidth / 2}, 0)`}
                            key={i}
                            className={`flow-group ${linkType} ${isHighlighted ? 'is-highlighted' : ''} ${isTooSmallForText ? 'is-overflowing' : ''}`}
                            id={`link-from-${from.key}-to-${to.key}`}
                          // style={{ zIndex: i }}
                          // @todo disabling for now because of bug
                          // onMouseOver={() => setHighlightedItem({ type: 'link', value: [from.key, to.key] })}
                          >
                            {
                              isFraude ?
                                linkType === 'Imports' ?
                                  <g className="fraude-group Imports" transform={`translate(0, ${from.y + strokeWidth / 2})`}>
                                    <path
                                      transform={`translate(0, ${to.y})`}
                                      className="fraude-flow"
                                      d={`
                                      M ${0} ${-strokeWidth / 2}
                                      L ${-width / 50} ${0}
                                      L ${0} ${strokeWidth / 2}
                                      Z`
                                      }
                                      //         d={`
                                      //         M ${0} ${-strokeWidth / 2}
                                      //         L ${width / 3 - 20} ${-strokeWidth / 2}
                                      //         L ${width / 3 - 40} ${0}
                                      //         L ${width / 3 - 20} ${strokeWidth / 2}
                                      //         L ${0} ${strokeWidth / 2}
                                      // Z
                                      // `
                                      //         }
                                      fill={color}
                                      fillOpacity={.5}
                                    />
                                    <path
                                      transform={`translate(0, ${to.y})`}
                                      className="fraude-flow diagonals-flow"

                                      d={`
                                      M ${0} ${-strokeWidth / 2}
                                      L ${-width / 50} ${0}
                                      L ${0} ${strokeWidth / 2}
                                      Z`
                                      }
                                      fill={'url(#diagonalHatch)'}
                                    />
                                    {/* <text x={-5} y={10} className="number-label right">{`${formatNumber(value)} lt. (fraude ?)`}</text> */}
                                    <text x={-width/50} y={strokeWidth + 5} className="number-label left">{`${formatNumber(value)} lt. (${notDunkerque ? 'fraude ou consommation' : 'fraude ?'})`}</text>

                                  </g>
                                  :
                                  <g className="fraude-group Exports" transform={`translate(0, ${from.y + strokeWidth / 2})`}>
                                    <path
                                      d={`
                                          M ${0} ${-strokeWidth / 2}
                                          L ${width / 3 - 20} ${-strokeWidth / 2}
                                          L ${width / 3} ${0}
                                          L ${width / 3 - 20} ${strokeWidth / 2}
                                          L ${0} ${strokeWidth / 2}
                                          Z`
                                      }
                                      fill={color}
                                      fillOpacity={.5}
                                    />
                                    <path
                                      d={`
                                        M ${0} ${-strokeWidth / 2}
                                        L ${width / 3 - 20} ${-strokeWidth / 2}
                                        L ${width / 3} ${0}
                                        L ${width / 3 - 20} ${strokeWidth / 2}
                                        L ${0} ${strokeWidth / 2}
                                        Z`
                                      }
                                      fill={'url(#diagonalHatch)'}
                                    />
                                    <text x={5} y={5} className="number-label right">{`${formatNumber(value)} lt. (fraude ?)`}</text>
                                  </g>
                                :
                                // not fraude
                                <g className="flow-group-detail">
                                  <path
                                    className="big-flow"
                                    d={
                                      partialCirclePathD(
                                        0,
                                        centerY + strokeWidth / 2,
                                        radius,
                                        // (height - (to.y) - (partnerBarHeight - from.y)) / 2,
                                        // (height - (to.y) - (partnerBarHeight - from.y)) / 2,
                                        Math.PI / 2,
                                        Math.PI * 3 / 2,
                                      )
                                    }
                                    strokeWidth={strokeWidth - 1}
                                    stroke={color}
                                    fill='none'
                                    transform={`${linkType === 'Exports' ? 'scale(-1, 1)' : ''}`}
                                  />
                                  <path
                                    className={`dashed-flow-arrow`}
                                    transform={`translate(${linkType === 'Exports' ? 5 : -5}, 0)${linkType === 'Exports' ? 'scale(-1, 1)' : ''}`}
                                    d={
                                      isFraude ?
                                        `
                                                  M ${0} ${0}
                                                  L ${width} ${0}
                                                  `
                                        :
                                        partialCirclePathD(
                                          0,
                                          centerY + strokeWidth / 2,
                                          radius,
                                          linkType === 'Imports' ? Math.PI / 2 : Math.PI * 3 / 2,
                                          linkType === 'Imports' ? Math.PI * 3 / 2 : Math.PI / 2,
                                        )
                                    }
                                    strokeWidth={'1'}
                                    stroke='black'
                                    strokeDasharray='5, 5'
                                    fill={'none'}
                                    markerEnd={hideArrows ? undefined : 'url(#arrow-head-white)'}
                                  />
                                  <text
                                    x={linkType === 'Imports' ? -5 : 5}
                                    y={endY + strokeWidth / 2 - 2}
                                    className={`number-label ${linkType === 'Imports' ? 'left' : 'right'}`}>
                                    {formatNumber(value) + ' lt.'}
                                  </text>
                                </g>
                            }


                          </g>
                        )
                      })
                  }
                </g>
              )
            })
        }
      </g>
      <g
        className="center-circle"
        transform={`translate(${width / 2 - barWidth / 2}, ${productBarHeight})`}
      >
        <g
          transform={`translate(${0}, ${centerCircleHeight / 2})`}
        >
          <path
            d={partialCirclePathD(
              0,
              0,
              centerCircleHeight * .4,
              Math.PI / 2,
              Math.PI * 3 / 2,
            )}
            strokeWidth={2}
            stroke='black'
            fill='transparent'
            markerEnd={hideArrows ? undefined : 'url(#arrow-head)'}
            transform={`translate(-5, 0)`}
          />
          <text
            x={20}
            y={2}
            style={{ fontStyle: 'italic', fontSize: 10 }}
            textAnchor='end'
          >
            Imports
          </text>
        </g>
        <g
          transform={`translate(${barWidth}, ${centerCircleHeight / 2})`}
        >
          <path
            d={partialCirclePathD(
              0,
              0,
              centerCircleHeight * .4,
              Math.PI / 2,
              Math.PI * 3 / 2,
            )}
            strokeWidth={2}
            stroke='black'
            fill='transparent'
            markerEnd={hideArrows ? undefined : 'url(#arrow-head)'}
            transform={`translate(5, 0)rotate(180)`}
          />
          <text
            x={15}
            y={2}
            style={{ fontStyle: 'italic', fontSize: 10 }}
            textAnchor='end'
          >
            Exports
          </text>
        </g>
      </g>
      <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
        <path
          d="M-1,1 l2,-2
                M0,4 l4,-4
                M3,5 l2,-2"
          style={{
            stroke: 'grey',
            strokeWidth: 1
          }}
        />
      </pattern>

      <foreignObject
        x={width - barWidth * 4}
        y={height * .8}
        width={barWidth * 2}
        height={centerCircleHeight * 3}
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{fontSize: 12, textAlign: 'right'}}
        >
        {`Valeur manquante dans les exports par rapport aux imports : ${formatNumber(Math.abs(sumFraudeExports - sumFraudeImports))} lt.`}
          </div>
      </foreignObject>
    </svg>
  )
}
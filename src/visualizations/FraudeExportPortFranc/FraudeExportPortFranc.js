import React, { useMemo, useReducer, useState, useEffect } from "react";
import cx from 'classnames';
import colorsPalettes from "../../utils/colorPalettes";

import AlluvialImportExport from "../../components/AlluvialImportExport";

import translate from "../../utils/translate";

import './FraudeExportPortFranc.scss';

const {importsExports: palette} = colorsPalettes;

// const AVAILABLE_PORTS = ['Marseille']
// const AVAILABLE_PORTS = [ 'Dunkerque', 'Bayonne', 'Marseille']

const AVAILABLE_PORTS = [ 'Bayonne', 'Marseille']

export default function FraudeExportPortFranc({
    data: inputData,
    dimensions,
    atlasMode,
    lang,
    showPorts = AVAILABLE_PORTS,// Lorient also available
    ...props
}) {
    const [visiblePorts, setVisiblePorts] = useState(showPorts);
    useEffect(() => {
      setVisiblePorts(showPorts);
    }, [showPorts]);
    const [focus, setFocus] = useReducer((lastState, newState) => {
        if (lastState === newState) { return undefined; }
        return newState;
    }, undefined);

    const { width, height } = dimensions;
    const refDimension = atlasMode ? width : height;
    const margin = 30;

    /** @type {Object[]} */
    const data = useMemo(function prepareData() {
 
        let preparedData = inputData
            // .filter(({ aggregate_type }) => aggregate_type === 'detail_products')
            .map(({ value, partner_type, product_type, ...rest }) => {
                return {
                  ...rest,
                    value: +value, // string to number

                    partner_type: translate('AlluvialImportExport', partner_type, lang),
                    product_type: product_type ? translate('AlluvialImportExport', product_type, lang) : product_type,
                }
            });
        return preparedData;
    }, [inputData]);
    return (
        <div
            className={cx('FraudeExportPortFranc', {'is-atlas-mode': atlasMode})}
            style={{
                width,
                height
            }}
        >
            <div className='FraudeExportPortFranc-list' >
              {
                AVAILABLE_PORTS.map((port) => {
                  const isVisible = visiblePorts.includes(port);
                  // const vizHeight = (visiblePorts.length > 1 ? height / 2 + margin : height);
                  const vizHeight = (visiblePorts.length > 1 ? height / 2 : height);
                  return (
                    <div 
                      key={port} 
                      
                      className={cx('FraudeExportPortFranc-box', {'is-visible': isVisible})}>
                        <h3 onClick={() => setFocus(port)}>{port}</h3>
                       
                        <AlluvialImportExport
                            dimensions={{
                              width: width, // atlasMode ? (refDimension / 2 - margin) : refDimension,
                              height: vizHeight // atlasMode ? height * .6 : refDimension
                                // width:  (atlasMode ? refDimension / (visiblePorts.length > 1 ? 2 : 1) - margin : Math.max(width * .6, refDimension / visiblePorts.length * 1.2)),
                                // height:  (atlasMode ? refDimension / (visiblePorts.length > 1 ? 2 : 1) * .6 - margin : refDimension / visiblePorts.length - 10)
                            }}
                            colorPalette={palette}
                            lang={lang}
                            notDunkerque
                            data={
                              data.filter(({ port: thatPort, aggregate_type }) => thatPort === port && aggregate_type === 'detail_products')}
                        />
                    </div>
                  )
                })
              }
              
            </div>
            {
              atlasMode ?
              <ul className="selector-container">
                {
                  AVAILABLE_PORTS
                  .map(port => {
                    const handleClick = () => {
                      if (visiblePorts.includes(port) && visiblePorts.length > 1) {
                        setVisiblePorts(
                          visiblePorts.filter(p => p !== port)
                          .sort()
                        )
                      } else if (!visiblePorts.includes(port)) {
                        setVisiblePorts([...visiblePorts, port])
                        .sort()
                      }
                    }
                    return (
                      <li onClick={handleClick} key={port}>
                        <input type="radio" readOnly checked={visiblePorts.includes(port)}/>
                        <span>
                          {port}
                        </span>
                      </li>
                    )
                  })
                }
              </ul>
              : null
            }
        </div>
    )
}
import React, { useState, useReducer, useEffect, useRef, useContext } from 'react';
import { Helmet } from "react-helmet";
import { useScrollYPosition } from 'react-use-scroll-position';
import cx from 'classnames';
import ReactTooltip from 'react-tooltip';

import { SettingsContext } from '../../utils/contexts';
import { VisualisationContext } from '../../utils/contexts';
import { fetchDataCsv } from '../../utils/fetch';

import Caller from '../../components/Caller';
import Loader from '../../components/Loader';
import VisualizationController from '../../components/VisualizationController';
import VisualizationFocus from '../../components/VisualizationFocus';

import { buildPageTitle } from '../../utils/misc';
import visualizationsMetas from '../../data/viz';

const CENTER_FRACTION = 0.6;

import './ScrollyPage.scss';


/**
 * Import .mdx files to render text and viz (<Caller/>) on a long page to scroll
 * @param {Object} props
 * @param {Object} props.contents Multilingual
 * @param {Object} props.titles Multilingual
 * @returns {React.ReactElement}
 */

export default function ScrollyPage ({
    contents,
    titles,
    ...props
}) {
    const { lang } = useContext(SettingsContext);
    const Content = contents[lang];
    const title = buildPageTitle(titles[lang], lang);
    const sectionRef = useRef(null);

    /** @type {[Object, Function]} */
    const [visualizations, setVisualizations] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {}
    )
    /** @type {[Object, Function]} */
    const [data, setData] = useState({});
    /** @type {['process'|'failed'|'successed', Function]} */
    const [loadingState, setLoadingState] = useState('process');
    /** @type {['process'|'finished', Function]} */
    const [loadingStateCallers, setLoadingStateCallers] = useState('process');

    /**
     * Register a new viz to the page list
     * @param {Object} params
     * @param {*} params.ref Caller element from React.useRef
     * @param {String} params.visualizationId Viz id
     * @param {String} params.callerId Caller id
     */
    function onRegisterVisualization (params) {
        setVisualizations({
            ...visualizations,
            [params.callerId]: { ...params }
        });
    }

    /**
     * Remove a viz from the page list
     * @param {String} callerId 
     */
    function onUnregisterVisualization (callerId) {
        const newVis = Object.entries(visualizations).reduce((res, [thatId, payload]) => {
            if (thatId === callerId) {
              return res;
            }
            return {
              ...res,
              [thatId]: payload
            }
          }, {})
          setVisualizations(newVis)
    }
    
    /**
     * Scroll to the <Caller/> onclick event
     * @param {*} ref Caller element from React.useRef
     */
    function onClickCallerScroll (ref) {
        const { y: initialVisY } = ref.current.getBoundingClientRect();
        const visY = initialVisY + window.scrollY;
        const DISPLACE_Y = window.innerHeight * CENTER_FRACTION;
        const scrollTo = visY - DISPLACE_Y * .9;
        window.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
        });
    }

    useEffect(() => {
        setTimeout(() => {
            setLoadingStateCallers('finished');
        }, 300);
    }, []);

    useEffect(() => {
        if (loadingStateCallers !== 'finished') {
            return;
        }

        setLoadingState('process');

        let filesCsvToLoad = new Set();
        const visualisationsIds = Object
            .values(visualizations)
            .map(vizMetas => vizMetas.visualizationId)
            .filter(vizId => vizId !== undefined)

        for (const id of visualisationsIds) {
            const vizOutputs = visualizationsMetas[id]['outputs'];
            vizOutputs.forEach(output => filesCsvToLoad.add(output));
        }

        filesCsvToLoad = Array.from(filesCsvToLoad);

        Promise.all(
            filesCsvToLoad.map(fileToLoad => fetchDataCsv(fileToLoad))
        )
        .then((datasets) => {
            let payload = {};
            for (let i = 0; i < datasets.length; i++) {
                payload[filesCsvToLoad[i]] = datasets[i];
            }
            setData(payload);
            setLoadingState('sucessed');
        })
        .catch((error) => {
            setLoadingState('failed');
            console.error(error);
        })
    }, [loadingStateCallers]);

    if (loadingState === 'process') {
        return <Loader message='En cours de chargement' />
    }
    if (loadingState === 'failed') {
        return <Loader message='Échec du chargement' />
    }

    console.log(data);

    return (
        <VisualisationContext.Provider value={{
            onRegisterVisualization,
            onUnregisterVisualization,
            onClickCallerScroll
        }}>

            <Helmet>
                <title>{title}</title>
            </Helmet>

            <div className='ScrollyPage'>
                <section ref={sectionRef}>
                    <Content components={{Caller}} />
                </section>

                <aside>

                </aside>
            </div>

        </VisualisationContext.Provider>
    );
}
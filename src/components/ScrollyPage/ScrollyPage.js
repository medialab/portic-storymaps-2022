import React, { useState, useReducer, useEffect, useRef, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { useScrollYPosition } from 'react-use-scroll-position';
import ReactTooltip from 'react-tooltip';
import cx from 'classnames';

import { VisualisationContext } from '../../utils/contexts';
import { fetchDataCsv } from '../../utils/fetch';

import Caller from '../../components/Caller';
import Loader from '../../components/Loader';
import VisualizationContainer from '../../components/VisualizationContainer';

import { buildPageTitle } from '../../utils/misc';
import visualizationsMetas from '../../data/viz';

const CENTER_FRACTION = 0.6;

import './ScrollyPage.scss';
import translate from '../../utils/translate';

/**
 * Import .mdx files to render text and viz (<Caller/>) on a long page to scroll
 * @param {Object} props
 * @param {Object} props.contents Multilingual
 * @param {Object} props.titles Multilingual
 * @returns {React.ReactElement}
 */

export default function ScrollyPage ({
    Content,
    title,
    chapter,
    ...props
}) {
    const { lang } = useParams()
        , sectionRef = useRef(null)
        , scrollY = useScrollYPosition();

    title = buildPageTitle(title, lang);

    /** @type {[Object, Function]} */
    const [visualizations, setVisualizations] = useReducer(
        (state, {type, payload}) => {
            switch(type) {
                case 'SET':
                    return payload;
                default:
                case 'MERGE':
                    return { ...state, ...payload }
            }
            
        },
        {}
    )
    const [data, setData] = useState({});
    /** @type {['process'|'failed'|'successed', Function]} */
    const [loadingState, setLoadingState] = useState('process');
    /** @type {[Boolean, Function]} */
    const [isFocusOnViz, setIsFocusOnViz] = useState(false);
    /** @type {[String, Function]} */
    const [focusedVizId, setFocusedVizId] = useState(null);
    /** @type {['content'|'viz', Function]} */
    const [activeSideOnResponsive, setActiveSideOnResponsive] = useState('content');

    /**
     * Register a new viz to the page list
     * @param {Object} params
     * @param {*} params.ref Caller element from React.useRef
     * @param {String} params.visualizationId Viz id
     * @param {String} params.callerId Caller id
     */
    function onRegisterVisualization (params) {
        setVisualizations({
            type: 'MERGE',
            payload: {
                [params.callerId]: { ...params }
            }
        });
    }
    
    /**
     * Scroll to the <Caller/> onclick event
     * The scrollTo function launch scroll useEffect
     * @param {*} ref Caller element from React.useRef
     */
    function onClickCallerScroll (ref) {
        const { y: initialVizY } = ref.current.getBoundingClientRect();
        const vizY = initialVizY + window.scrollY;
        const DISPLACE_Y = window.innerHeight * CENTER_FRACTION; // center of screen
        const scrollTo = vizY - DISPLACE_Y * 0.9;

        window.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
        });
    }

    function onClickChangeResponsive () {
        if (activeSideOnResponsive === 'content') {
            setActiveSideOnResponsive('viz')
        }
        if (activeSideOnResponsive === 'viz') {
            setActiveSideOnResponsive('content')
        }
    }

    /**
     * When change of chapter, clean 'visualisations' state
     */
    useEffect(() => {
        setVisualizations({
            type: 'SET',
            payload: {}
        })
    }, [chapter]);

    /**
     * When scroll, set the focused visualisation
     */
    useEffect(() => {
        if (Object.keys(visualizations).length === 0) { return; }
        /* @todo this is a rustine, we don't understand
        why sometimes sectionRef is undefined
        */
        if (!sectionRef.current) {
          return;
        }
        const visualizationEntries = Object.entries(visualizations);
        const DISPLACE_Y = window.innerHeight * CENTER_FRACTION;
        const y = scrollY + DISPLACE_Y;
        const sectionDims = sectionRef.current && sectionRef.current.getBoundingClientRect();
        const sectionEnd = sectionDims.y + window.scrollY + sectionDims.height;

        // if the Y position is out from scroll section, hide viz (use to avoid hiding the footer)
        if (y > sectionEnd) {
            setIsFocusOnViz(false);
            return;
        }
        setIsFocusOnViz(true);

        for (let i = visualizationEntries.length - 1; i >= 0; i--) {
            const [vizId, vizParms] = visualizationEntries[i];
            const { ref } = vizParms;

            if (!!ref.current === false) { continue; }

            const { y: initialVizY } = ref.current.getBoundingClientRect();
            let vizY = initialVizY + window.scrollY;

            if (y > vizY) {
                setFocusedVizId(vizParms.visualizationId);
                break;
            }
        }
    }, [scrollY, sectionRef]);

    /**
     * When change of chapter, store each CSV output in 'data' sate
     * for each chapter output
     */
    useEffect(() => {
        setLoadingState('process');

        let filesCsvToLoad = new Set(
            Object.keys(visualizationsMetas)
                .map(vizId => visualizationsMetas[vizId])
                .filter(viz => viz['n_chapitre'] === chapter)
                .map(viz => viz['outputs'])
                .flat()
        );
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
            setLoadingState('successed');
        })
        .catch((error) => {
            setLoadingState('failed');
            console.error(error);
        })
    }, [chapter]);

    /**
     * When load viz caller, set the first as focused in 'focusedVizId' state
     */
    useEffect(() => {
        const firstCallerViz = Object.values(visualizations)[0];

        if (firstCallerViz === undefined) {
            setIsFocusOnViz(false);
            return;
        }

        const firstCallerVizId = firstCallerViz.visualizationId;

        setIsFocusOnViz(true);
        setFocusedVizId(firstCallerVizId);
    }, [visualizations]);

    if (loadingState === 'process') {
        return <Loader message='En cours de chargement' />
    }
    if (loadingState === 'failed') {
        return <Loader message='Échec du chargement' />
    }

    return (
        <VisualisationContext.Provider value={{
            onRegisterVisualization,
            onClickCallerScroll,
            focusedVizId
        }}>

            <Helmet>
                <title>{title}</title>
            </Helmet>

            <div className='ScrollyPage'>
                <ReactTooltip id="contents-tooltip" />
                <section className={cx("content", {'is-focused': activeSideOnResponsive === 'content'})} ref={sectionRef}>
                    <button
                        className='switch-btn'
                        onClick={onClickChangeResponsive}
                        data-for="contents-tooltip"
                        data-effect="solid"
                        data-tip={translate('vizContainer', 'switchToContent', lang)}
                    >➡</button>
                    <Content components={{Caller}} />
                </section>

                <aside className={cx({'is-focused': activeSideOnResponsive === 'viz'})}>
                    <button
                        className='switch-btn'
                        onClick={onClickChangeResponsive}
                        data-for="contents-tooltip"
                        data-effect="solid"
                        data-tip={translate('vizContainer', 'switchToViz', lang)}
                    >⬅</button>
                    {
                        isFocusOnViz && 
                        <VisualizationContainer {
                            ...{
                                focusedVizId,
                                data
                            }
                        } />
                    }
                </aside>
            </div>

        </VisualisationContext.Provider>
    );
}
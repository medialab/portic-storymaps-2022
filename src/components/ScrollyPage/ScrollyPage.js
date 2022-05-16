import React, { useState, useReducer, useEffect, useRef, useContext, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
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

    const location = useLocation();

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
    const [focusedVizId, setFocusedVizId] = useState(undefined);
    /** @type {[String, Function]} */
    const [focusedCallerId, setFocusedCallerId] = useState(undefined);
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
     * @param {Object} props Caller props
     * @param {*} props.ref Caller ref
     * @param {String} props.visualizationId
     * @param {String} props.callerId
     * @param {Boolean} props.canFocusOnScroll Need click to be displayed as overflow
     * @param {Object} props.callerProps Caller input props
     */
    function onClickCallerScroll ({ref, visualizationId, callerId, canFocusOnScroll, callerProps}) {
        const { y: initialVizY } = ref.current.getBoundingClientRect();
        const vizY = initialVizY + window.scrollY;
        const DISPLACE_Y = window.innerHeight * CENTER_FRACTION; // center of screen
        const scrollTo = vizY - DISPLACE_Y * 0.9;
        
        if (canFocusOnScroll === false) {
            setIsFocusOnViz(true);
            setFocusedVizId(visualizationId);
            setFocusedCallerId(callerId);
            return;
        }

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

    useEffect(() => {
        if (!!location.hash === '') { return; }
        const hash = location.hash.substring(1)
        // @todo I know, it is very ugly, may be illegal, but I did not find another way
        const interval = setInterval(() => {
            const locatedTitle = document.getElementById(hash);
            if (locatedTitle !== null) {
                locatedTitle.scrollIntoView();
                clearInterval(interval);
            }
        }, 1000);
    }, [location]);

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

        if (scrollY === 0) {
            const [firstCallerId, firstVizParms] = visualizationEntries[0];
            const { visualizationId: firstVizId } = firstVizParms;
            setFocusedVizId(firstVizId);
            setFocusedCallerId(firstCallerId);
            return;
        }

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
            const [callerId, vizParms] = visualizationEntries[i];
            const { visualizationId } = vizParms;
            const { ref, canFocusOnScroll } = vizParms;

            if (!!ref.current === false) { continue; }

            const { y: initialVizY } = ref.current.getBoundingClientRect();
            let vizY = initialVizY + window.scrollY;

            if (y > vizY && canFocusOnScroll) {
                setFocusedVizId(visualizationId);
                setFocusedCallerId(callerId);
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
        const visualizationEntries = Object.entries(visualizations);

        if (visualizationEntries[0] === undefined) {
            setIsFocusOnViz(false);
            return;
        }
        setIsFocusOnViz(true);

        const [firstCallerId, firstVizParms] = visualizationEntries[0];
        const { visualizationId: firstVizId } = firstVizParms;

        setFocusedVizId(firstVizId);
        setFocusedCallerId(firstCallerId);
    }, [visualizations]);

    if (loadingState === 'process') {
        return <Loader message='En cours de chargement' />
    }
    if (loadingState === 'failed') {
        return <Loader message='Échec du chargement' />
    }

    return (
        <>
            <Helmet>
                <title>{title}</title>
            </Helmet>

            <div className='ScrollyPage'>
                <ReactTooltip id="contents-tooltip" />
                <section className={cx("Contents", {'is-focused': activeSideOnResponsive === 'content'})} ref={sectionRef}>
                    <button
                        className='switch-btn'
                        onClick={onClickChangeResponsive}
                        data-for="contents-tooltip"
                        data-effect="solid"
                        data-tip={translate('vizContainer', 'switchToContent', lang)}
                    >➡</button>
                    <VisualisationContext.Provider value={{
                        onRegisterVisualization,
                        onClickCallerScroll,
                        focusedCallerId
                    }}>
                        <Content components={{Caller, Link}} />
                    </VisualisationContext.Provider>
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
                        <VisualizationContainer
                            callerProps={visualizations[focusedCallerId]['props']}
                            { ...{
                                focusedVizId,
                                data
                            }}
                        />
                    }
                </aside>
            </div>
        </>
    );
}
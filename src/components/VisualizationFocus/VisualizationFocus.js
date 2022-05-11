import { useState, useRef, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import packageJSON from '../../../package.json';
import copy from 'copy-to-clipboard';
import VisualizationController from '../../visualizations';
import Md from 'react-markdown';

import translate from '../../utils/translate';
import visualizationsMetas from '../../data/viz';

import './VisualizationFocus.scss';

const { homepage } = packageJSON;

/**
 * Displays an overlay with a visualization and its meta and descriptions in a 2-to-1 columns layout
 * @param {Object} props
 * @param {Function} props.onClickClose
 * @returns {React.ReactElement}
 */
export default function VisualizationFocus({
    focusedVizId: vizId,
    data,
    onClickClose,
    ...props
}) {
    const { lang } = useParams();

    const dimensions = {
        width: 1000,
        height: 500
    }

    let {
        lien_permanent_visualisation: permalink,
        ...metas
    } = Object.keys(visualizationsMetas)
        .map(vizId => visualizationsMetas[vizId])
        .find(viz => viz['id'] === vizId);

    const title = metas['titre_' + lang] || false
        , description = metas['description_' + lang] || false
        , howToRead = metas['comment_lire_' + lang] || false
        , howItsMade = metas['comment_cest_fait_' + lang] || false;

    const messages = {
        description: translate('vizFocus', 'description', lang),
        howItsMade: translate('vizFocus', 'howItsMade', lang),
        howToRead: translate('vizFocus', 'howToRead', lang),
        copyLink: translate('vizFocus', 'copyLink', lang),
        linkCopied: translate('vizFocus', 'linkCopied', lang)
    }

    function onClickCopy (e) {
        e.stopPropagation();

        copy('https://myllaume.fr/');

        setCopyClicked(true);
        setTimeout(() => setCopyClicked(false), 5000);
    }

    function onKeyEscape (e) {
        if (e.keyCode === 27) {
            onClickClose();
        }
    }

    const inputRef = useRef(null);
    const [copyClicked, setCopyClicked] = useState(false);

    useEffect(() => {
        if (inputRef && inputRef.current) {
            inputRef.current.focus();
        }
    }, [])

    return (
        <div className='VisualizationFocus is-visible'>
            <input
                style={{ opacity: 0, zIndex: -10, 'pointerEvents': 'none' }}
                type="text"
                onKeyUp={onKeyEscape}
                ref={inputRef}
            />
            <div onClick={onClickClose} className="lightbox-background" />

            <div className="lightbox-contents-container">
                <div className="lightbox-contents">

                    <div className="visualization-details">
                        <div className="details-header">
                            {title && <h2>TITRE</h2>}
                            <button className="close-btn" onClick={onClickClose}>
                                ✕
                            </button>
                        </div>
                        <div className="copy-link-container">
                        <button onClick={onClickCopy}>{copyClicked ? messages.linkCopied : messages.copyLink}</button>
                        </div>
                        <div className="details-contents">
                            {
                                description ?
                                    <section className="details-contents-section">
                                        <h3>{messages.description}</h3>
                                        <Md>
                                            {description.replace(/<br\/>/g, '\n\n')}
                                        </Md>
                                    </section>
                                    : null
                            }
                            {
                                howItsMade ?
                                    <section className="details-contents-section">
                                        <h3>{messages.howItsMade}</h3>
                                        <Md>
                                            {howItsMade.replace(/<br\/>/g, '\n\n')}
                                        </Md>
                                    </section>
                                    : null
                            }
                            {
                                howToRead ?
                                    <section className="details-contents-section">
                                        <h3>{messages.howToRead}</h3>
                                        <Md>
                                            {howToRead.replace(/<br\/>/g, '\n\n')}
                                        </Md>
                                    </section>
                                    : null
                            }
                        </div>
                    </div>
                    <div className="visualization-wrapper" onClick={onClickClose}>
                        <VisualizationController
                            focusedVizId={vizId}
                            {
                                ...{
                                    dimensions,
                                    lang,
                                    data
                                }
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
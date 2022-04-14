import { useState, useRef, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import packageJSON from '../../../package.json';
import copy from 'copy-to-clipboard';
import VisualizationController from '../../visualizations';
import Md from 'react-markdown';

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
        height: 1000
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
        description: {
            fr: "De quoi s'agit t'il ?",
            en: 'What is about ?',
        },
        howItsMade: {
            fr: 'Comment les données et la visualisation ont-elles été produites ?',
            en: 'How were the data and visualization produced ?',
        },
        howToRead: {
            fr: 'Comment lire la visualisation ?',
            en: 'How to read the visualization?'
        },
        copyLink: {
            fr: 'copier le lien de cette visualisation',
            en: 'copy this visualization link'
        },
        linkCopied: {
            fr: 'lien copié dans le presse-papier !',
            en: 'link copied in the clipboard !'
        }
    }

    function onClickCopy (e) {
        e.stopPropagation();

        copy('https://myllaume.fr/');

        setCopyClicked(true);
        setTimeout(() => setCopyClicked(false), 5000);
    }

    function onKeyEscape (e) {
        console.log(e);
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
                        <button onClick={onClickCopy}>{copyClicked ? messages.linkCopied[lang] : messages.copyLink[lang]}</button>
                        </div>
                        <div className="details-contents">
                            {
                                description ?
                                    <section className="details-contents-section">
                                        <h3>{messages.description[lang]}</h3>
                                        <Md>
                                            {description.replace(/<br\/>/g, '\n\n')}
                                        </Md>
                                    </section>
                                    : null
                            }
                            {
                                howItsMade ?
                                    <section className="details-contents-section">
                                        <h3>{messages.howItsMade[lang]}</h3>
                                        <Md>
                                            {howItsMade.replace(/<br\/>/g, '\n\n')}
                                        </Md>
                                    </section>
                                    : null
                            }
                            {
                                howToRead ?
                                    <section className="details-contents-section">
                                        <h3>{messages.howToRead[lang]}</h3>
                                        <Md>
                                            {howToRead.replace(/<br\/>/g, '\n\n')}
                                        </Md>
                                    </section>
                                    : null
                            }
                        </div>
                    </div>
                    <div className="visualization-wrapper">
                        <VisualizationController
                            focusedVizId={vizId}
                            {
                                ...{
                                    dimensions,
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
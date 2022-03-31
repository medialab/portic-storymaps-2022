import React, { useState } from 'react';
import { Link } from "react-router-dom";

/**
 * Header contains navigation and…
 * @param {Object} props
 * @param {Boolean} props.willOpen
 * @param {String[]} props.langagesFlag
 * @returns {React.ReactElement}
 */

export default function Header({
    willOpenNav,
    langagesFlag,
    langController,
}) {
    /**
     * @type {['loading'|'failed'|'success', Function]}
     * @typedef {Function} setLoadingState Set the app state of fetch
     */
    const [isOpen, setIsOpen] = useState(willOpenNav);
    const [lang, setLang] = langController;

    function onClickOpen () {
        setIsOpen(!isOpen);
    }

    function onClickLang (langFlag) {
        setLang(langFlag);
    }

    return (
        <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <button className="navbar-burger" aria-label="menu" aria-expanded="false" onClick={onClickOpen}>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </button>
            </div>

            <div className={'navbar-menu' + (isOpen === true ? ' is-active' : '')}>
                <div className="navbar-start">
                    <Link to='/' className="navbar-item">Accueil</Link>
                    <Link to='partie-0' className="navbar-item">Intro</Link>
                    <Link to='partie-1' className="navbar-item">Partie 1</Link>
                    <Link to='partie-2' className="navbar-item">Partie 2</Link>
                    <Link to='about' className="navbar-item">À propos</Link>
                </div>
            </div>

            <div className='langbar'>
                {
                    langagesFlag.map((flag, i) =>
                        <button
                            key={i}
                            className={'button is-small is-white' + (lang === flag ? 'is-active' : '')}
                            onClick={() => onClickLang(flag)}
                        >{flag}</button>)
                }
            </div>
        </nav>
    )
}
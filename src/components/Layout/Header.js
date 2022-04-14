import React, { useState } from 'react';
import { Link } from "react-router-dom";

import routes from '../../summary';

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
    onLangChange,
    lang,
}) {
    /**
     * @type {['loading'|'failed'|'success', Function]}
     * @typedef {Function} setLoadingState Set the app state of fetch
     */
    const [isOpen, setIsOpen] = useState(willOpenNav);
    // const [lang, setLang] = langController;

    function onClickOpen () {
        setIsOpen(!isOpen);
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
                    {
                        routes.map(({ routes, titles }, i) => {
                            const pagePath = routes[lang];
                            const title = titles[lang];
                            return <Link to={`/${lang}/${pagePath}`} className="navbar-item" key={i}>{title}</Link>
                        })
                    }
                    <Link to='atlas' className="navbar-item">Atlas</Link>
                    <Link to='about' className="navbar-item">À propos</Link>
                </div>
            </div>

            <div className='langbar'>
                {
                    langagesFlag.map((flag, i) =>
                        <button
                            key={i}
                            className={'button is-small is-white' + (lang === flag ? 'is-active' : '')}
                            onClick={() => onLangChange(flag)}
                        >{flag}</button>)
                }
            </div>
        </nav>
    )
}
import React, { useState } from 'react';
import { Routes, Route, HashRouter, Navigate } from "react-router-dom";

import Layout from './components/Layout';
import Home from './components/Home'
import About from './components/About'
import Atlas from './components/Atlas'

import Partie0 from './content/fr/partie-0.mdx'
import Partie1 from './content/fr/partie-1.mdx'
import Partie2 from './content/fr/partie-2.mdx'

import routes from './summary';

import './styles/app.scss'


const LANGUAGES = ['fr', 'en'];

export default function App() {
  /**
   * @type {['fr'|'en', Function]}
   * @typedef {Function} setLang Set the app langage for i18n
   */
  return (
    <HashRouter>
    <div className="App">

        <Routes>
          <Route path="/:lang/" element={
            <Layout />
          }>
            {// looping through the page
              LANGUAGES.map(lang => {
                return routes
                  .map(({
                    titles,
                    routes: inputRoute,
                    contents,
                    Component: ThatComponent,
                  }, index) => {
                    const route = `page/${inputRoute[lang]}`;
                    return (
                      <Route key={index} path={route} exact
                        element={
                          <ThatComponent
                            {
                            ...{
                              contents,
                              titles,
                            }
                            }
                          />
                        }
                      >
                      </Route>
                    )
                  })
              })
            }
            <Route path="atlas/:visualizationId?" component={Atlas} />
            <Route path="about" element={<About />} />
            <Route index element={<Home />} />
          </Route>
          <Route
                path="*"
                element={<Navigate to="fr" />}
            />
        </Routes>
    </div>
    </HashRouter>
  );
}
import React, { useState } from 'react';
import { Routes, Route, HashRouter, Navigate } from "react-router-dom";

import Layout from './components/Layout';
import Home from './components/Home'
import About from './components/About'
import Atlas from './components/Atlas'

import routes from './summary';

import './styles/app.scss'

const langagesFlag = ['fr', 'en'];

export default function App() {
  return (
    <HashRouter>
    <div className="App">

        <Routes>
          <Route key='lang' path="/:lang/" element=
            {
              // Header, Footer, Contexts and Outlet to include below routes
              <Layout langagesFlag={langagesFlag} />
            }
          >
            {
              langagesFlag.map(lang => {
                return routes
                  .map(({
                    titles,
                    routes: inputRoute,
                    contents,
                    Component: ThatComponent,
                  }, index) => {
                    const path = `page/${inputRoute[lang]}`;
                    return (
                      <Route key={index} path={path} exact
                        element={
                          <ThatComponent // ScrollyPage or PlainPage
                            {
                            ...{
                              contents, // Mdx files, for each lang
                              titles, // for each lang
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
            <Route key='atlas' path="atlas/:visualizationId?" component={Atlas} />
            <Route key='about' path="about" element={<About />} />
            <Route key='home' index element={<Home />} />
          </Route>
          <Route
            key='404'
            path="*"
            element={<Navigate to="fr" />}
          />
        </Routes>
    </div>
    </HashRouter>
  );
}
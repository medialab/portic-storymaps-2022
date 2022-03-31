import React, { useState } from 'react';
import { Routes, Route } from "react-router-dom";

import Layout from './Layout';
import Home from './Home'
import About from './About'
import ScrollyPage from './ScrollyPage'

import Partie0 from '../content/partie-0.mdx'
import Partie1 from '../content/partie-1.mdx'
import Partie2 from '../content/partie-2.mdx'

import { SettingsContext } from '../utils/contexts';

import '../styles/app.scss'

export default function App() {
  /**
   * @type {['fr'|'en', Function]}
   * @typedef {Function} setLang Set the app langage for i18n
   */
  const [lang, setLang] = useState('fr');

  return (
    <div className="App">
      <SettingsContext.Provider value={{
        lang
      }}>

        <Routes>
          <Route path="/" element={
            <Layout
              langController={[lang, setLang]}
              langagesFlag={['fr', 'en']}
            />
          }>
            <Route index element={<Home />} />
            <Route path="partie-0" element={<ScrollyPage Content={Partie0} title='Intro' />} />
            <Route path="partie-1" element={<ScrollyPage Content={Partie1} title='Partie 1' />} />
            <Route path="partie-2" element={<ScrollyPage Content={Partie2} title='Partie 2' />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>

      </SettingsContext.Provider>
    </div>
  );
}
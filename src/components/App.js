import React, { useState } from 'react';
import { Routes, Route } from "react-router-dom";

import Layout from './Layout';
import Home from './Home'
import About from './About'

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
            <Route path="about" element={<About />} />
          </Route>
        </Routes>

      </SettingsContext.Provider>
    </div>
  );
}
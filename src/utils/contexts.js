import React, { createContext, useState } from 'react';

/**
 * Context used for communicating user setting as lang, theme…
 * @exemple
 * ```
 * import { SettingsContext } from '../utils/contexts'
 * // get global langage
 * const { lang } = useContext(SettingsContext);
 * ```
 */

export const SettingsContext = React.createContext({});

/**
 * Context used for communicating user setting as lang, theme…
 * @exemple
 * ```
 * import { VisualisationContext } from '../utils/contexts'
 * // get list of page viz
 * const { list } = useContext(VisualisationContext);
 * ```
 */

export const VisualisationContext = React.createContext({});

export const VisualisationProvider = ({ children }) => {
    const [list, setList] = useState([]);
    return (
        <VisualisationContext.Provider value={{ list, setList }}>
            {children}
        </VisualisationContext.Provider>
    );
};
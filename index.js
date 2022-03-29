import React from 'react';
import { render } from 'react-dom';
import { HashRouter } from "react-router-dom";

import App from './src/components/App';

// import '../node_modules/bulma/css/bulma.min.css';

render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
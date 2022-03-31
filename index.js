import React from 'react';
import { render } from 'react-dom';

import App from './src/App';

// import '../node_modules/bulma/css/bulma.min.css';

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
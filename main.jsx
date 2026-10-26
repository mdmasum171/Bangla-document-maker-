import React from 'react';
import ReactDOM from 'react-dom/client';
// Fonts are bundled locally (no Google Fonts request -> better privacy, works offline)
import '@fontsource/noto-sans-bengali/400.css';
import '@fontsource/noto-sans-bengali/500.css';
import '@fontsource/noto-sans-bengali/700.css';
import '@fontsource/noto-serif-bengali/400.css';
import '@fontsource/noto-serif-bengali/700.css';
import './index.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

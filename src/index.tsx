import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Could not find the root element');
}

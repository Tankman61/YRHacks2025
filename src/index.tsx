import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Use the existing root element provided in index.html
const container = document.getElementById('root');
if (!container) {
  console.error("No element with id 'root' found in index.html");
} else {
  const rootDiv = ReactDOM.createRoot(container);
  rootDiv.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

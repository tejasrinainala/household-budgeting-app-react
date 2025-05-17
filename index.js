
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App'; // Adjust the path based on your file structure
import './index.css'; // Ensure the CSS path is correct

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

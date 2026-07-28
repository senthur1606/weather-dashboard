import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'leaflet/dist/leaflet.css';

import { ThemeProvider } from './context/ThemeContext';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
);

// PWA Service Worker registration
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/sw.js')
//       .then((reg) => console.log('SW registered:', reg))
//       .catch((err) => console.log('SW registration failed:', err));
//   });
// }

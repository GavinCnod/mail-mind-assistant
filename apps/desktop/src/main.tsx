import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, LocaleProvider } from '@mailmind/ui';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </ThemeProvider>
  </React.StrictMode>
);

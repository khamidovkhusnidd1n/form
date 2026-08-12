import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { I18nProvider } from './i18n';
import { DataProvider } from './store/dataStore';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </I18nProvider>
  </StrictMode>
);

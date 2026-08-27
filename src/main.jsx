import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Estilos de PrimeReact
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// Estilos globales (Tailwind)
import './index.css';

import App from './App.jsx';

// Providers
import { AppPrimeReactProvider } from './config/primeReact.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppPrimeReactProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppPrimeReactProvider>
  </StrictMode>
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { GrievanceProvider } from './context/GrievanceContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <GrievanceProvider>
        <App />
      </GrievanceProvider>
    </AuthProvider>
  </React.StrictMode>
);

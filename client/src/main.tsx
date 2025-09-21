// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/authContext.tsx';
import { Toaster } from 'react-hot-toast';
import { NotificationProvider } from './context/notificationContext.tsx'; // Import NotificationProvider
import {ChatProvider} from './context/ChatContext.tsx'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
        <NotificationProvider> {/* Wrap the App */}
          <App />
          <Toaster position="top-center" />
        </NotificationProvider>
          </ChatProvider>

      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
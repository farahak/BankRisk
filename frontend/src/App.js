// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import des composants
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ClientDashboard from './components/client/ClientDashboard';
import ClientProfile from './components/client/ClientProfile';
import CreditApplication from './components/client/CreditApplication';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminAnalytics from './components/admin/AdminAnalytics';
import ClientList from './components/admin/ClientList';
import ClientDetail from './components/admin/ClientDetail';
import DebugAPI from './components/admin/DebugAPI';
import NewClient from './components/admin/NewClient';
import ApplicationDetail from './components/admin/ApplicationDetail';

import authService from './services/authService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Composant de redirection intelligente
function SmartRedirect() {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (authService.isAuthenticated()) {
      if (authService.isAdmin()) {
        navigate('/admin/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);
  
  return null;
}

// Route protégée
const PrivateRoute = ({ children, adminOnly = false }) => {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/client/dashboard" />;
  }

  // Si un client essaie d'accéder aux routes admin
  if (!adminOnly && isAdmin) {
    return <Navigate to="/admin/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Route Debug (accessible aux admins) */}
          <Route
            path="/debug"
            element={
              <PrivateRoute adminOnly={true}>
                <DebugAPI />
              </PrivateRoute>
            }
          />

          {/* Routes Client */}
          <Route
            path="/client/dashboard"
            element={
              <PrivateRoute>
                <ClientDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/client/profile"
            element={
              <PrivateRoute>
                <ClientProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/client/apply-credit"
            element={
              <PrivateRoute>
                <CreditApplication />
              </PrivateRoute>
            }
          />

          {/* Routes Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminAnalytics />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/clients"
            element={
              <PrivateRoute adminOnly={true}>
                <ClientList />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/clients/:id"
            element={
              <PrivateRoute adminOnly={true}>
                <ClientDetail />
              </PrivateRoute>
            }
          />
           <Route
            path="/admin/clients/new"
            element={
              <PrivateRoute adminOnly={true}>
                <NewClient />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/applications/:id"
            element={
              <PrivateRoute adminOnly={true}>
                <ApplicationDetail />
              </PrivateRoute>
            }
          />

          {/* Redirection par défaut */}
          <Route path="/" element={<SmartRedirect />} />
          <Route path="*" element={<SmartRedirect />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
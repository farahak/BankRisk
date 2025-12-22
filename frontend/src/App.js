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
import ClientMessages from './components/client/ClientMessages';
import CreditApplication from './components/client/CreditApplication';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminAnalytics from './components/admin/AdminAnalytics';
import ClientList from './components/admin/ClientList';
import ClientDetail from './components/admin/ClientDetail';
import DebugAPI from './components/admin/DebugAPI';
import NewClient from './components/admin/NewClient';
import ApplicationDetail from './components/admin/ApplicationDetail';
import LandingPage from './components/public/LandingPage';

import authService from './services/authService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#136DA5', // BTK Blue
      dark: '#0F5682',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5B83C9', // BTK Secondary Blue
    },
    error: {
      main: '#E11B22', // BTK Accent Red
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#64748B',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(19, 109, 165, 0.2)',
          },
        },
      },
    },
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
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
            path="/client/messages"
            element={
              <PrivateRoute>
                <ClientMessages />
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

          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Redirection par défaut (si déjà connecté) */}
          <Route path="/home" element={<SmartRedirect />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
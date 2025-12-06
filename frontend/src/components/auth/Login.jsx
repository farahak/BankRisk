// src/components/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import authService from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(formData);
      
      // Redirection selon le rôle
      if (authService.isAdmin()) {
        navigate('/admin/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(
        err.email?.[0] ||
        err.password?.[0] ||
        err.non_field_errors?.[0] ||
        err.detail ||
        'Email ou mot de passe incorrect'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour remplir automatiquement les champs
  const fillCredentials = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LoginIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              BankRisk AI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Système Intelligent d'Évaluation de Crédit
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              autoComplete="email"
              autoFocus
            />

            <TextField
              fullWidth
              label="Mot de passe"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Se connecter'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Pas encore de compte ?{' '}
                <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
                  S'inscrire
                </Link>
              </Typography>
            </Box>
          </form>

          <Divider sx={{ my: 3 }}>Comptes de test</Divider>

          {/* Comptes de démonstration */}
          <Box sx={{ mb: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: '#e3f2fd',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#bbdefb' },
                mb: 1,
              }}
              onClick={() => fillCredentials('admin@bankrisk.com', 'admin123')}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                👨‍💼 Compte Administrateur
              </Typography>
              <Typography variant="caption" color="text.secondary">
                admin@bankrisk.com / admin123
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: '#f3e5f5',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#e1bee7' },
              }}
              onClick={() => fillCredentials('client@bankrisk.com', 'client123')}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                👤 Compte Client
              </Typography>
              <Typography variant="caption" color="text.secondary">
                client@bankrisk.com / client123
              </Typography>
            </Paper>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              💡 Cliquez sur un compte de test pour remplir automatiquement les champs
            </Typography>
          </Alert>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
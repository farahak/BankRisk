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
  Grid,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, AccountBalance } from '@mui/icons-material';
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
      if (authService.isAdmin()) {
        navigate('/admin/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);

      let errorMsg = 'Email ou mot de passe incorrect';

      if (err.response?.data) {
        const data = err.response.data;
        if (data.non_field_errors) errorMsg = data.non_field_errors[0];
        else if (data.error) errorMsg = data.error;
        else if (data.detail) errorMsg = data.detail;
        else if (typeof data === 'string') errorMsg = data;
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'white' }}>
      <Grid container>
        {/* Colonne Gauche: Image & Brand (Visible sur Desktop) */}
        <Grid
          item
          xs={0}
          md={6}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #136DA5 0%, #0F5682 100%)',
            color: 'white',
            p: 8,
            position: 'relative',
          }}
        >
          <Box sx={{ maxWidth: 450, textAlign: 'center' }}>
            <AccountBalance sx={{ fontSize: 80, mb: 4 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Bienvenue sur votre Espace Client
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400 }}>
              Connectez-vous pour gérer vos demandes de crédit et suivre vos analyses en temps réel avec notre IA.
            </Typography>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: 40,
              left: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              &copy; {new Date().getFullYear()} BTK Bank AI
            </Typography>
          </Box>
        </Grid>

        {/* Colonne Droite: Formulaire */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 2, sm: 8 }
          }}
        >
          <Box sx={{ maxWidth: 400, width: '100%' }}>
            <Box sx={{ mb: 6, textAlign: { xs: 'center', md: 'left' } }}>
              <Box sx={{ display: { md: 'none' }, mb: 2 }}>
                <AccountBalance color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                Connexion
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Entrez vos identifiants pour accéder à votre compte.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Adresse Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                margin="normal"
                variant="outlined"
                sx={{ mb: 2 }}
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
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ mt: 1, mb: 3, textAlign: 'right' }}>
                <Link to="#" style={{ textDecoration: 'none', color: '#136DA5', fontSize: '0.875rem', fontWeight: 600 }}>
                  Mot de passe oublié ?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  borderRadius: 2,
                  boxShadow: '0 8px 16px rgba(19, 109, 165, 0.25)',
                  mb: 4
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
              </Button>

              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Vous n'avez pas encore de compte ?{' '}
                  <Link to="/register" style={{ textDecoration: 'none', color: '#136DA5', fontWeight: 600 }}>
                    Créer un compte
                  </Link>
                </Typography>
              </Box>
            </form>

            <Divider sx={{ mb: 4 }}>
              <Typography variant="caption" color="text.secondary">OU UTILISER UN COMPTE TEST</Typography>
            </Divider>

            <Stack spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#136DA5' },
                  transition: '0.2s'
                }}
                onClick={() => fillCredentials('admin@bankrisk.com', 'admin123')}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  👨‍💼 Accès Administrateur
                </Typography>
                <Typography variant="caption" color="text.secondary">admin@bankrisk.com / admin123</Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#136DA5' },
                  transition: '0.2s'
                }}
                onClick={() => fillCredentials('client@bankrisk.com', 'client123')}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  👤 Accès Client
                </Typography>
                <Typography variant="caption" color="text.secondary">client@bankrisk.com / client123</Typography>
              </Paper>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
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
  Grid,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd, AccountBalance } from '@mui/icons-material';
import authService from '../../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email et mot de passe sont requis');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...registrationData } = formData;
      await authService.register(registrationData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Erreur inscription:', err);

      // Extraction robuste du message d'erreur
      let errorMsg = 'Une erreur est survenue lors de l\'inscription';

      if (err.response?.data) {
        const data = err.response.data;
        if (data.email) errorMsg = `Email: ${data.email[0]}`;
        else if (data.password) errorMsg = `Mot de passe: ${data.password[0]}`;
        else if (data.error) {
          if (data.error.includes('duplicate key error')) {
            errorMsg = 'Cet adresse email est déjà utilisée par un autre compte.';
          } else {
            errorMsg = data.error;
          }
        }
        else if (data.non_field_errors) errorMsg = data.non_field_errors[0];
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
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
            <PersonAdd sx={{ fontSize: 80, mb: 4 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Commencez votre expérience IA
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400 }}>
              Rejoignez BTK BankRisk et bénéficiez d'une évaluation de crédit instantanée et sécurisée.
            </Typography>
          </Box>
          <Box sx={{ position: 'absolute', bottom: 40, left: 40 }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              &copy; {new Date().getFullYear()} BTK Bank AI
            </Typography>
          </Box>
        </Grid>

        {/* Colonne Droite: Formulaire d'inscription */}
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
          <Box sx={{ maxWidth: 500, width: '100%' }}>
            <Box sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
              <Box sx={{ display: { md: 'none' }, mb: 2 }}>
                <AccountBalance color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                Créer un compte
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Rejoignez le futur de la banque en quelques étapes.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                Inscription réussie ! Redirection...
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>

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
                helperText="Minimum 6 caractères"
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

              <TextField
                fullWidth
                label="Confirmer le mot de passe"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                margin="normal"
                variant="outlined"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || success}
                sx={{
                  py: 1.5,
                  mt: 3,
                  mb: 3,
                  fontSize: '1rem',
                  borderRadius: 2,
                  boxShadow: '0 8px 16px rgba(19, 109, 165, 0.25)',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'S\'inscrire'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Vous avez déjà un compte ?{' '}
                  <Link to="/login" style={{ textDecoration: 'none', color: '#136DA5', fontWeight: 600 }}>
                    Se connecter
                  </Link>
                </Typography>
              </Box>
            </form>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register;
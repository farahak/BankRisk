// src/components/client/ClientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  AddCard,
  Assessment,
  CheckCircle,
  Pending,
  Cancel,
  Warning,
  Message,
} from '@mui/icons-material';
import authService from '../../services/authService';
import clientService from '../../services/clientService';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userEmail = authService.getCurrentUser();
      const userFullName = authService.getCurrentUserFullName();
      setUser({
        email: userEmail,
        fullName: userFullName
      });

      // Charger le profil client
      const clientData = await clientService.getClientByEmail(userEmail);
      setClient(clientData);

      // Charger les demandes de crédit de l'utilisateur
      if (clientData) {
        const userApplications = await clientService.getApplicationsByUserEmail(userEmail);
        setApplications(userApplications);
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle />;
      case 'pending':
        return <Pending />;
      case 'rejected':
        return <Cancel />;
      default:
        return <Warning />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
      default:
        return status;
    }
  };

  const getRiskLabel = (risk) => {
    switch (risk) {
      case 'good':
        return 'Bon';
      case 'bad':
        return 'Mauvais';
      case 'pending':
        return 'En cours';
      default:
        return risk;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'good':
        return 'success';
      case 'bad':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* En-tête */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mr: 1, color: 'primary.main' }}>
              BTK <span style={{ color: '#333' }}>BankRisk</span>
            </Typography>
            <Chip label="Client" size="small" variant="outlined" color="primary" sx={{ fontWeight: 700 }} />
          </Box>

          <Button
            color="inherit"
            startIcon={<Message />}
            onClick={() => navigate('/client/messages')}
            sx={{ mr: 2 }}
          >
            Messages
          </Button>

          <Button
            color="inherit"
            startIcon={<AccountCircle />}
            onClick={() => navigate('/client/profile')}
            sx={{ mr: 2 }}
          >
            Mon Profil
          </Button>

          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Bannière de bienvenue */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #136DA5 0%, #0F5682 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(19, 109, 165, 0.2)',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 800,
                  border: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
                Bienvenue sur BTK <span style={{ opacity: 0.8 }}>BankRisk</span>
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {user?.fullName || user?.email}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                Espace Client Sécurisé • German Credit Intelligence
              </Typography>

              {!client && (
                <Alert
                  severity="warning"
                  sx={{
                    mt: 2,
                    bgcolor: 'rgba(255,152,0,0.1)',
                    color: '#ff9800',
                    border: '1px solid rgba(255,152,0,0.2)',
                    '& .MuiAlert-icon': { color: '#ff9800' }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ⚠️ Profil incomplet : Veuillez compléter vos informations pour libérer l'accès aux demandes de crédit.
                  </Typography>
                </Alert>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Actions principales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate('/client/apply-credit')}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <AddCard sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Demander un Crédit
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Soumettez une nouvelle demande de crédit et obtenez une évaluation rapide basée sur l'IA
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ mt: 3 }}
                  fullWidth
                  disabled={!client}
                >
                  {client ? 'Nouvelle Demande' : 'Complétez votre profil'}
                </Button>
                {!client && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Profil requis pour soumettre une demande
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate('/client/profile')}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <AccountCircle sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Mon Profil
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gérez vos informations personnelles et consultez votre historique
                </Typography>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ mt: 3 }}
                  fullWidth
                >
                  {client ? 'Voir le Profil' : 'Créer le Profil'}
                </Button>
                {client && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Profil complet ✓
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Mes demandes de crédit */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Assessment sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Mes Demandes de Crédit ({applications.length})
            </Typography>
          </Box>

          {applications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <AddCard sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucune demande de crédit
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {client
                  ? "Vous n'avez pas encore soumis de demande de crédit"
                  : "Complétez votre profil pour soumettre votre première demande"
                }
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddCard />}
                onClick={() => navigate(client ? '/client/apply-credit' : '/client/profile')}
              >
                {client ? 'Faire une Demande' : 'Compléter le Profil'}
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {applications.map((app) => (
                <Grid item xs={12} key={app.id}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                    onClick={() => navigate(`/client/applications/${app.id}`)}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={2}>
                          <Typography variant="caption" color="text.secondary">
                            Date
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {app.submission_date ? new Date(app.submission_date).toLocaleDateString('fr-FR') : 'N/A'}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                          <Typography variant="caption" color="text.secondary">
                            Montant
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {app.credit_amount?.toLocaleString()} €
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                          <Typography variant="caption" color="text.secondary">
                            Durée
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {app.duration} mois
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <Typography variant="caption" color="text.secondary">
                            Objectif
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {app.purpose}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={1}>
                          <Chip
                            label={getRiskLabel(app.risk)}
                            color={getRiskColor(app.risk)}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={2}>
                          <Chip
                            icon={getStatusIcon(app.status)}
                            label={getStatusLabel(app.status)}
                            color={getStatusColor(app.status)}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Statistiques personnelles */}
        {applications.length > 0 && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={3}>
              <Card elevation={0} sx={{ bgcolor: '#e3f2fd', border: 'none' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {applications.length}
                  </Typography>
                  <Typography variant="body2" color="primary.main">
                    Demandes totales
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card elevation={0} sx={{ bgcolor: '#e8f5e9', border: 'none' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {applications.filter(app => app.status === 'approved').length}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Demandes approuvées
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card elevation={0} sx={{ bgcolor: '#fff3cd', border: 'none' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                    {applications.filter(app => app.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    En attente
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card elevation={0} sx={{ bgcolor: '#ffebee', border: 'none' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                    {applications.filter(app => app.status === 'rejected').length}
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    Demandes rejetées
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Informations utiles */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ bgcolor: '#e3f2fd', border: 'none' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                  🚀 Évaluation Rapide
                </Typography>
                <Typography variant="body2">
                  Notre IA analyse votre demande en temps réel pour une réponse rapide et précise basée sur le German Credit Dataset.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ bgcolor: '#f3e5f5', border: 'none' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="secondary" sx={{ fontWeight: 'bold' }}>
                  🔒 Sécurisé
                </Typography>
                <Typography variant="body2">
                  Vos données sont protégées avec les meilleurs standards de sécurité bancaire et conformes au RGPD.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ bgcolor: '#e8f5e9', border: 'none' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success.main" sx={{ fontWeight: 'bold' }}>
                  📊 Transparent
                </Typography>
                <Typography variant="body2">
                  Comprenez facilement les critères d'évaluation de votre demande de crédit grâce à notre système explicable.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ClientDashboard;
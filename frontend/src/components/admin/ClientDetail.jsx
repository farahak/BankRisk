// src/components/admin/ClientDetail.jsx (Corrigé)
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import clientService from '../../services/clientService';

const ClientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const [clientData, appsData] = await Promise.all([
        clientService.getClientById(id),
        clientService.getApplicationsByClient(id)
      ]);
      setClient(clientData);
      setApplications(appsData);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des données du client');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await clientService.deleteClient(id);
        navigate('/admin/clients');
      } catch (err) {
        setError('Erreur lors de la suppression du client');
      }
    }
  };

  const getJobLabel = (job) => {
    const labels = {
      0: 'Chômeur / Non qualifié non-résident',
      1: 'Non qualifié résident',
      2: 'Employé qualifié / Fonctionnaire',
      3: 'Cadre / Hautement qualifié',
    };
    return labels[job] || `Niveau ${job}`;
  };

  const getAccountLabel = (account) => {
    const labels = {
      'little': 'Peu (≤ 100 DM)',
      'moderate': 'Modéré (100-500 DM)',
      'quite rich': 'Assez riche (500-1000 DM)',
      'rich': 'Riche (> 1000 DM)',
      'NA': 'Non renseigné',
    };
    return labels[account] || account;
  };

  const getPurposeLabel = (purpose) => {
    const labels = {
      'car': '🚗 Voiture',
      'radio/TV': '📺 Radio/TV',
      'furniture/equipment': '🛋️ Meubles/Équipement',
      'education': '🎓 Éducation',
      'business': '💼 Affaires',
      'domestic appliances': '🏠 Électroménager',
      'repairs': '🔧 Réparations',
      'vacation/others': '✈️ Vacances/Autres',
    };
    return labels[purpose] || purpose;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!client) {
    return (
      <Container>
        <Alert severity="error">Client non trouvé</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/admin/clients')}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            Détails du Client - German Credit Dataset
          </Typography>
          <Button
            color="inherit"
            startIcon={<Edit />}
            onClick={() => navigate(`/admin/clients/${id}/edit`)}
          >
            Modifier
          </Button>
          <Button
            color="inherit"
            startIcon={<Delete />}
            onClick={handleDelete}
          >
            Supprimer
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Informations personnelles */}
          <Grid item xs={12} md={6}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Informations Personnelles
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {client.user_email || 'N/A'}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Âge
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {client.age} ans
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Sexe
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={client.sex === 'male' ? 'Homme' : 'Femme'}
                        color={client.sex === 'male' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Informations professionnelles */}
          <Grid item xs={12} md={6}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Informations Professionnelles
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Niveau d'emploi
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {getJobLabel(client.job)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Type de logement
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={client.housing === 'own' ? 'Propriétaire' : 
                             client.housing === 'rent' ? 'Locataire' : 'Gratuit'}
                      color="info"
                      size="small"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Informations financières */}
          <Grid item xs={12} md={6}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Informations Financières
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Compte épargne
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {getAccountLabel(client.saving_accounts)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Compte courant
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {getAccountLabel(client.checking_account)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistiques du client */}
          <Grid item xs={12} md={6}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Statistiques
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Demandes de crédit
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {applications.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Dernière demande
                    </Typography>
                    <Typography variant="body2">
                      {applications.length > 0 
                        ? new Date(applications[0].submission_date).toLocaleDateString()
                        : 'Aucune'
                      }
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Historique des demandes de crédit */}
          {applications.length > 0 && (
            <Grid item xs={12}>
              <Card elevation={0}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Historique des Demandes de Crédit ({applications.length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Date</strong></TableCell>
                          <TableCell><strong>Montant</strong></TableCell>
                          <TableCell><strong>Durée</strong></TableCell>
                          <TableCell><strong>Objectif</strong></TableCell>
                          <TableCell><strong>Risque</strong></TableCell>
                          <TableCell><strong>Statut</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow key={app.id} hover>
                            <TableCell>
                              {new Date(app.submission_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="bold">
                                {app.credit_amount?.toLocaleString()} €
                              </Typography>
                            </TableCell>
                            <TableCell>{app.duration} mois</TableCell>
                            <TableCell>{getPurposeLabel(app.purpose)}</TableCell>
                            <TableCell>
                              <Chip
                                label={app.risk === 'good' ? 'Bon' : 'Mauvais'}
                                color={app.risk === 'good' ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={app.status === 'approved' ? 'Approuvé' : 
                                       app.status === 'rejected' ? 'Rejeté' : 'En attente'}
                                color={app.status === 'approved' ? 'success' : 
                                       app.status === 'rejected' ? 'error' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {applications.length === 0 && (
            <Grid item xs={12}>
              <Card elevation={0}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Aucune demande de crédit
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ce client n'a pas encore soumis de demande de crédit.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default ClientDetail;
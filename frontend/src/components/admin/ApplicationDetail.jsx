// src/components/admin/ApplicationDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  CheckCircle,
  Cancel,
  Pending,
  Warning,
  Insights,
  Message,
} from '@mui/icons-material';
import clientService from '../../services/clientService';
import MessageThread from './MessageThread';

const ApplicationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [application, setApplication] = useState(null);

  const [evaluationData, setEvaluationData] = useState({
    status: '',
    risk: '',
    risk_score: '',
    evaluator_comment: '',
  });

  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const appData = await clientService.getApplicationById(id);
      setApplication(appData);

      setEvaluationData({
        status: appData.status || 'pending',
        risk: appData.risk || 'pending',
        risk_score: appData.risk_score || '',
        evaluator_comment: appData.evaluator_comment || '',
      });
    } catch (err) {
      setError('Erreur lors du chargement de la demande');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationChange = (e) => {
    setEvaluationData({
      ...evaluationData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveEvaluation = async () => {
    try {
      setSaving(true);
      setError('');

      await clientService.evaluateApplication(id, evaluationData);

      setSuccess('Évaluation sauvegardée avec succès !');
      await loadApplication(); // Recharger les données

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
      console.error('Erreur:', err);
    } finally {
      setSaving(false);
    }
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

  const getJobLabel = (job) => {
    const labels = {
      0: 'Chômeur / Non qualifié non-résident',
      1: 'Non qualifié résident',
      2: 'Employé qualifié / Fonctionnaire',
      3: 'Cadre / Hautement qualifié',
    };
    return labels[job] || `Niveau ${job}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!application) {
    return (
      <Container>
        <Alert severity="error">Demande non trouvée</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/admin/dashboard')}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            Détails de la Demande - German Credit Dataset
          </Typography>
          <Button
            color="inherit"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
            onClick={handleSaveEvaluation}
            disabled={saving}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Tabs Navigation */}
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab label="Détails de la Demande" />
            <Tab label="Messages" icon={<Message />} iconPosition="start" />
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Tab Content */}
        {currentTab === 0 && (
          <Grid container spacing={3}>
            {/* Informations de la demande */}
            <Grid item xs={12} md={8}>
              <Card elevation={0} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
                    Détails de la Demande
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Montant demandé
                      </Typography>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>
                        {application.credit_amount?.toLocaleString()} €
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Taux d'intérêt (IA)
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>
                        {application.interest_rate}%
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Durée
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {application.duration} mois
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Mensualité estimée
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {(application.credit_amount * (application.interest_rate / 100 / 12) / (1 - Math.pow(1 + (application.interest_rate / 100 / 12), -application.duration))).toFixed(2)} €/mois
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Objectif
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {getPurposeLabel(application.purpose)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* --- SECTION ANALYSE IA --- */}
              <Card elevation={0} sx={{ mt: 3, borderRadius: 3, border: '1px solid rgba(19, 109, 165, 0.1)', bgcolor: '#F8FAFC' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Insights color="primary" sx={{ mr: 1, fontSize: 30 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      Analyse IA BankRisk
                    </Typography>
                  </Box>

                  <Grid container spacing={4}>
                    <Grid item xs={12} sm={5} sx={{ textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                        <Box sx={{
                          width: 140,
                          height: 140,
                          borderRadius: '50%',
                          border: '10px solid',
                          borderColor: application.risk_score > 60 ? '#ef4444' : application.risk_score > 30 ? '#f59e0b' : '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          bgcolor: 'white',
                          boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                        }}>
                          <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1 }}>
                            {Math.round(application.risk_score)}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>
                            SCORE
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="h6" sx={{
                        fontWeight: 800,
                        color: application.risk_score > 60 ? 'error.main' : application.risk_score > 30 ? 'warning.main' : 'success.main'
                      }}>
                        Risque {application.risk === 'bad' ? 'Élevé' : application.risk === 'good' ? 'Faible' : 'Modéré'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={7}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Facteurs d'influence
                      </Typography>
                      <Stack spacing={2}>
                        {application.analysis_details?.factors?.map((factor, idx) => (
                          <Box key={idx}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {factor.label}
                              </Typography>
                              <Typography variant="body2" sx={{
                                fontWeight: 800,
                                color: factor.type === 'negative' ? 'error.main' : 'success.main'
                              }}>
                                {factor.impact > 0 ? `+${factor.impact}` : factor.impact} pts
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={Math.abs(factor.impact) * 4}
                              color={factor.type === 'negative' ? 'error' : 'success'}
                              sx={{ height: 6, borderRadius: 3, bgcolor: '#E2E8F0' }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Informations du client */}
              {application.client && (
                <Card elevation={0} sx={{ mt: 3, borderRadius: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>
                      Informations du Client
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {application.client.user_email || 'N/A'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Typography variant="caption" color="text.secondary">
                          Âge
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {application.client.age} ans
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Typography variant="caption" color="text.secondary">
                          Sexe
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {application.client.sex === 'male' ? 'Homme' : 'Femme'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Emploi
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {getJobLabel(application.client.job)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Logement
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {application.client.housing === 'own' ? 'Propriétaire' :
                            application.client.housing === 'rent' ? 'Locataire' : 'Gratuit'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Évaluation */}
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Évaluation de la Demande
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        label="Statut *"
                        name="status"
                        value={evaluationData.status}
                        onChange={handleEvaluationChange}
                        required
                      >
                        <MenuItem value="pending">🟡 En attente</MenuItem>
                        <MenuItem value="approved">🟢 Approuvé</MenuItem>
                        <MenuItem value="rejected">🔴 Rejeté</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        label="Risque *"
                        name="risk"
                        value={evaluationData.risk}
                        onChange={handleEvaluationChange}
                        required
                      >
                        <MenuItem value="pending">🟡 En cours</MenuItem>
                        <MenuItem value="good">🟢 Bon</MenuItem>
                        <MenuItem value="bad">🔴 Mauvais</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Score de risque (%)"
                        name="risk_score"
                        type="number"
                        value={evaluationData.risk_score}
                        onChange={handleEvaluationChange}
                        inputProps={{ min: 0, max: 100, step: 1 }}
                        helperText="0-100% (0 = sans risque, 100 = risque maximum)"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Commentaire d'évaluation"
                        name="evaluator_comment"
                        value={evaluationData.evaluator_comment}
                        onChange={handleEvaluationChange}
                        helperText="Commentaires pour le client ou notes internes"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleSaveEvaluation}
                        disabled={saving}
                      >
                        {saving ? 'Sauvegarde...' : 'Sauvegarder l\'évaluation'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Statistiques rapides */}
              <Card elevation={0} sx={{ mt: 3, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Statistiques
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Mensualité estimée
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {application.credit_amount && application.duration
                        ? `${(application.credit_amount / application.duration).toFixed(2)} €/mois`
                        : '-'
                      }
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Montant total à rembourser
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {application.credit_amount?.toLocaleString()} €
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Messages Tab */}
        {currentTab === 1 && (
          <MessageThread applicationId={id} />
        )}
      </Container>
    </Box>
  );
};

export default ApplicationDetail;
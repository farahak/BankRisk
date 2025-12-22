// src/components/client/CreditApplication.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
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
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack,
  Send,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import clientService from '../../services/clientService';
import authService from '../../services/authService';

const steps = ['Informations du crédit', 'Vérification du profil', 'Confirmation'];

const CreditApplication = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [interestRate, setInterestRate] = useState(4.5);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  const [formData, setFormData] = useState({
    // Informations du crédit
    credit_amount: '',
    duration: '',
    purpose: 'car',

    // Informations du profil (si manquant)
    age: '',
    sex: 'male',
    job: 2,
    housing: 'rent',
    saving_accounts: 'NA',
    checking_account: 'NA',
  });

  useEffect(() => {
    checkUserProfile();
  }, []);

  useEffect(() => {
    if (formData.credit_amount && formData.duration) {
      updateEstimation();
    }
  }, [formData.credit_amount, formData.duration, formData.age, formData.job, formData.housing, formData.saving_accounts]);

  const updateEstimation = async () => {
    try {
      const estData = await clientService.estimateInterestRate(formData);
      setInterestRate(estData.interest_rate);

      const amount = parseFloat(formData.credit_amount);
      const duration = parseInt(formData.duration);
      const rate = estData.interest_rate / 100 / 12; // Taux mensuel

      if (rate > 0) {
        const payment = (amount * rate) / (1 - Math.pow(1 + rate, -duration));
        setMonthlyPayment(payment.toFixed(2));
      } else {
        setMonthlyPayment((amount / duration).toFixed(2));
      }
    } catch (err) {
      console.error('Estimation error:', err);
    }
  };

  const checkUserProfile = async () => {
    try {
      setCheckingProfile(true);
      const userEmail = authService.getCurrentUser();
      const client = await clientService.getClientByEmail(userEmail);

      if (client) {
        setHasProfile(true);
        setClientId(client.id);
        setFormData(prev => ({
          ...prev,
          age: client.age || '',
          sex: client.sex || 'male',
          job: client.job || 2,
          housing: client.housing || 'rent',
          saving_accounts: client.saving_accounts || 'NA',
          checking_account: client.checking_account || 'NA',
        }));
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleNext = () => {
    // Validation selon l'étape
    if (activeStep === 0) {
      if (!formData.credit_amount || !formData.duration) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      if (parseFloat(formData.credit_amount) < 250) {
        setError('Le montant minimum est de 250 €');
        return;
      }
      if (parseFloat(formData.credit_amount) > 100000) {
        setError('Le montant maximum est de 100 000 €');
        return;
      }
      if (parseInt(formData.duration) < 6 || parseInt(formData.duration) > 72) {
        setError('La durée doit être entre 6 et 72 mois');
        return;
      }
    }

    if (activeStep === 1 && !hasProfile) {
      if (!formData.age || !formData.sex || !formData.job || !formData.housing) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      if (parseInt(formData.age) < 18 || parseInt(formData.age) > 100) {
        setError('L\'âge doit être entre 18 et 100 ans');
        return;
      }
    }

    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Préparer les données pour la soumission
      const applicationData = {
        credit_amount: parseFloat(formData.credit_amount),
        duration: parseInt(formData.duration),
        purpose: formData.purpose,
      };

      // Si le client n'existe pas encore, inclure les données du profil
      if (!hasProfile) {
        applicationData.age = parseInt(formData.age);
        applicationData.sex = formData.sex;
        applicationData.job = parseInt(formData.job);
        applicationData.housing = formData.housing;
        applicationData.saving_accounts = formData.saving_accounts;
        applicationData.checking_account = formData.checking_account;
      }

      await clientService.submitCreditApplication(applicationData);
      setSuccess(true);

      setTimeout(() => {
        navigate('/client/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la soumission de la demande');
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
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

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Détails de votre demande de crédit
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Renseignez les informations concernant le crédit que vous souhaitez obtenir
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Montant souhaité (€)"
                name="credit_amount"
                type="number"
                value={formData.credit_amount}
                onChange={handleChange}
                required
                inputProps={{ min: 250, max: 100000, step: 100 }}
                helperText="Montant entre 250 € et 100 000 €"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Durée (mois)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                required
                inputProps={{ min: 6, max: 72 }}
                helperText="Entre 6 et 72 mois"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Objectif du crédit"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
              >
                <MenuItem value="car">🚗 Voiture</MenuItem>
                <MenuItem value="radio/TV">📺 Radio/TV</MenuItem>
                <MenuItem value="furniture/equipment">🛋️ Meubles/Équipement</MenuItem>
                <MenuItem value="education">🎓 Éducation</MenuItem>
                <MenuItem value="business">💼 Affaires</MenuItem>
                <MenuItem value="domestic appliances">🏠 Électroménager</MenuItem>
                <MenuItem value="repairs">🔧 Réparations</MenuItem>
                <MenuItem value="vacation/others">✈️ Vacances/Autres</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: 'rgba(19, 109, 165, 0.05)',
                  border: '1px solid rgba(19, 109, 165, 0.1)',
                  borderRadius: 2
                }}
              >
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                        Estimatif Taux annuel (TAEG)
                      </Typography>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>
                        {interestRate}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Mensualité estimée
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {monthlyPayment} €/mois
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', fontStyle: 'italic' }}>
                    * Le taux final sera déterminé par l'analyse approfondie de votre dossier par nos experts.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 1:
        if (checkingProfile) {
          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Vérification de votre profil...
              </Typography>
            </Box>
          );
        }

        if (hasProfile) {
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="success" icon={<CheckCircle />}>
                  <Typography variant="h6" gutterBottom>
                    Votre profil est complet !
                  </Typography>
                  <Typography variant="body2">
                    Nous avons toutes les informations nécessaires pour traiter votre demande.
                  </Typography>
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <Card elevation={0}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Récapitulatif de votre profil
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Âge</Typography>
                        <Typography variant="body2" fontWeight="bold">{formData.age} ans</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Sexe</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formData.sex === 'male' ? 'Homme' : 'Femme'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Emploi</Typography>
                        <Typography variant="body2" fontWeight="bold">{getJobLabel(formData.job)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Logement</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formData.housing === 'own' ? 'Propriétaire' : formData.housing === 'rent' ? 'Locataire' : 'Gratuit'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Si vos informations ont changé, vous pouvez les mettre à jour dans votre profil.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          );
        }

        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="warning" icon={<Warning />}>
                <Typography variant="h6" gutterBottom>
                  Complétez votre profil
                </Typography>
                <Typography variant="body2">
                  Nous avons besoin de quelques informations supplémentaires pour traiter votre demande selon le German Credit Dataset.
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Âge"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                required
                inputProps={{ min: 18, max: 100 }}
                helperText="Entre 18 et 100 ans"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Sexe"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required
              >
                <MenuItem value="male">Homme</MenuItem>
                <MenuItem value="female">Femme</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Niveau d'emploi"
                name="job"
                value={formData.job}
                onChange={handleChange}
                required
              >
                <MenuItem value={0}>0 - Chômeur / Non qualifié non-résident</MenuItem>
                <MenuItem value={1}>1 - Non qualifié résident</MenuItem>
                <MenuItem value={2}>2 - Employé qualifié / Fonctionnaire</MenuItem>
                <MenuItem value={3}>3 - Cadre / Hautement qualifié</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Type de logement"
                name="housing"
                value={formData.housing}
                onChange={handleChange}
                required
              >
                <MenuItem value="own">Propriétaire</MenuItem>
                <MenuItem value="rent">Locataire</MenuItem>
                <MenuItem value="free">Gratuit (famille/amis)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Compte épargne"
                name="saving_accounts"
                value={formData.saving_accounts}
                onChange={handleChange}
              >
                <MenuItem value="NA">Non renseigné</MenuItem>
                <MenuItem value="little">Peu (≤ 100 DM)</MenuItem>
                <MenuItem value="moderate">Modéré (100-500 DM)</MenuItem>
                <MenuItem value="quite rich">Assez riche (500-1000 DM)</MenuItem>
                <MenuItem value="rich">Riche ( ≥ 1000 DM)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Compte courant"
                name="checking_account"
                value={formData.checking_account}
                onChange={handleChange}
              >
                <MenuItem value="NA">Non renseigné</MenuItem>
                <MenuItem value="little">Peu (≤ 200 DM)</MenuItem>
                <MenuItem value="moderate">Modéré (200-1000 DM)</MenuItem>
                <MenuItem value="rich">Riche ( ≥ 1000 DM)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" icon={<Info />}>
                <Typography variant="body2">
                  Ces informations sont essentielles pour notre système d'évaluation de crédit basé sur le German Credit Dataset.
                  Elles nous aident à déterminer votre profil de risque de manière précise.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Confirmation de votre demande
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vérifiez les informations avant de soumettre votre demande
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '2px solid', borderColor: 'primary.main', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Montant demandé
                      </Typography>
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                        {parseFloat(formData.credit_amount).toLocaleString()} €
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Durée
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {formData.duration} mois
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Taux d'intérêt estimé
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {interestRate}%
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Mensualité estimée
                      </Typography>
                      <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold' }}>
                        {monthlyPayment} €/mois
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {!hasProfile && (
              <Grid item xs={12}>
                <Card elevation={0} sx={{ bgcolor: '#fff3cd', border: 'none' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Profil qui sera créé :
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Âge:</strong> {formData.age} ans
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Sexe:</strong> {formData.sex === 'male' ? 'Homme' : 'Femme'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Emploi:</strong> {getJobLabel(formData.job)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Logement:</strong> {formData.housing === 'own' ? 'Propriétaire' : formData.housing === 'rent' ? 'Locataire' : 'Gratuit'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  ⚠️ En soumettant cette demande, vous acceptez que vos informations soient analysées par notre système d'évaluation de crédit basé sur l'IA et le German Credit Dataset.
                  Vous recevrez une réponse sous 24-48 heures.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', maxWidth: 500 }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Demande soumise avec succès !
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Votre demande de crédit est en cours d'analyse par notre système IA basé sur le German Credit Dataset.
            Vous recevrez une notification dès que nous aurons terminé l'évaluation.
          </Typography>
          <CircularProgress size={30} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Redirection vers le dashboard...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/client/dashboard')}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Nouvelle Demande de Crédit
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Retour
            </Button>

            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                  size="large"
                >
                  {loading ? 'Soumission...' : 'Soumettre la demande'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={checkingProfile}
                  size="large"
                >
                  Suivant
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreditApplication;
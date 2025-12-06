// src/components/admin/NewClient.jsx
import React, { useState } from 'react';
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
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Person,
  Work,
  Home,
  AccountBalance,
} from '@mui/icons-material';
import clientService from '../../services/clientService';

const NewClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    user_email: '',
    age: '',
    sex: 'male',
    job: 2,
    housing: 'rent',
    saving_accounts: 'NA',
    checking_account: 'NA',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.user_email || !formData.age || !formData.sex || !formData.job || !formData.housing) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      if (parseInt(formData.age) < 18 || parseInt(formData.age) > 100) {
        setError('L\'âge doit être entre 18 et 100 ans');
        return;
      }

      if (!formData.user_email.includes('@')) {
        setError('Veuillez entrer un email valide');
        return;
      }

      setLoading(true);
      setError('');

      const clientData = {
        user_email: formData.user_email,
        age: parseInt(formData.age),
        sex: formData.sex,
        job: parseInt(formData.job),
        housing: formData.housing,
        saving_accounts: formData.saving_accounts,
        checking_account: formData.checking_account,
      };

      await clientService.createClient(clientData);
      
      setSuccess('Client créé avec succès !');
      
      setTimeout(() => {
        navigate('/admin/clients');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Erreur lors de la création du client');
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
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

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/admin/clients')}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            Nouveau Client - German Credit Dataset
          </Typography>
          <Button
            color="inherit"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Création...' : 'Créer le Client'}
          </Button>
        </Toolbar>
      </AppBar>

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

        <Grid container spacing={3}>
          {/* Informations Personnelles */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Informations Personnelles
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email *"
                      name="user_email"
                      type="email"
                      value={formData.user_email}
                      onChange={handleChange}
                      required
                      helperText="Email du client"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Âge *"
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
                      label="Sexe *"
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="male">Homme</MenuItem>
                      <MenuItem value="female">Femme</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Informations Professionnelles */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Work sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Informations Professionnelles
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Niveau d'emploi *"
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

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Type de logement *"
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
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Informations Financières */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AccountBalance sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Informations Financières
                  </Typography>
                </Box>

                <Grid container spacing={3}>
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
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Aperçu */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ bgcolor: '#f8f9fa', border: 'none' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Aperçu du Client
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formData.user_email || '-'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <Typography variant="caption" color="text.secondary">
                      Âge
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formData.age ? `${formData.age} ans` : '-'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <Typography variant="caption" color="text.secondary">
                      Sexe
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formData.sex === 'male' ? 'Homme' : 'Femme'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary">
                      Emploi
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formData.job !== undefined ? getJobLabel(formData.job) : '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/clients')}
                disabled={loading}
              >
                Annuler
              </Button>
              
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Création en cours...' : 'Créer le Client'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default NewClient;
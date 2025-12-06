// src/components/client/ClientProfile.jsx
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
  Avatar,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Edit,
  Person,
  Work,
  AccountBalance,
  Home,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import authService from '../../services/authService';
import clientService from '../../services/clientService';

const ClientProfile = () => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clientId, setClientId] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);

  const [profile, setProfile] = useState({
    age: '',
    sex: 'male',
    job: 2,
    housing: 'rent',
    saving_accounts: 'NA',
    checking_account: 'NA',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userEmail = authService.getCurrentUser();
      const clientData = await clientService.getClientByEmail(userEmail);
      
      if (clientData) {
        setProfile({
          age: clientData.age || '',
          sex: clientData.sex || 'male',
          job: clientData.job || 2,
          housing: clientData.housing || 'rent',
          saving_accounts: clientData.saving_accounts || 'NA',
          checking_account: clientData.checking_account || 'NA',
        });
        setClientId(clientData.id);
        setProfileComplete(true);
      } else {
        setProfileComplete(false);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      const profileData = {
        user_email: authService.getCurrentUser(),
        age: parseInt(profile.age),
        sex: profile.sex,
        job: parseInt(profile.job),
        housing: profile.housing,
        saving_accounts: profile.saving_accounts,
        checking_account: profile.checking_account,
      };

      if (clientId) {
        await clientService.updateClient(clientId, profileData);
      } else {
        const newClient = await clientService.createClient(profileData);
        setClientId(newClient.id);
        setProfileComplete(true);
      }

      setSuccess('Profil mis à jour avec succès !');
      setEditMode(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
      console.error(err);
    } finally {
      setSaving(false);
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

  const isProfileValid = () => {
    return profile.age && profile.sex && profile.job !== undefined && profile.housing;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
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
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            Mon Profil - German Credit Dataset
          </Typography>
          {!editMode ? (
            <Button
              color="inherit"
              startIcon={<Edit />}
              onClick={() => setEditMode(true)}
            >
              Modifier
            </Button>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => setEditMode(false)}
                sx={{ mr: 1 }}
              >
                Annuler
              </Button>
              <Button
                color="inherit"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                onClick={handleSave}
                disabled={saving || !isProfileValid()}
              >
                Enregistrer
              </Button>
            </>
          )}
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

        {/* Avatar et statut */}
        <Paper elevation={0} sx={{ p: 4, mb: 3, textAlign: 'center', borderRadius: 3 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              margin: '0 auto',
              bgcolor: profile.sex === 'male' ? 'primary.main' : 'secondary.main',
              fontSize: '2.5rem',
              mb: 2,
            }}
          >
            {authService.getCurrentUser()?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            {authService.getCurrentUserFullName() || authService.getCurrentUser()}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {authService.getCurrentUser()}
          </Typography>
          
          <Chip
            icon={profileComplete ? <CheckCircle /> : <Warning />}
            label={profileComplete ? 'Profil Complet' : 'Profil Incomplet'}
            color={profileComplete ? 'success' : 'warning'}
            variant="outlined"
          />
          
          {!profileComplete && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Complétez votre profil pour pouvoir soumettre des demandes de crédit
            </Typography>
          )}
        </Paper>

        <Grid container spacing={3}>
          {/* Informations Personnelles */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Informations Personnelles
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Âge"
                      name="age"
                      type="number"
                      value={profile.age}
                      onChange={handleChange}
                      disabled={!editMode}
                      required
                      inputProps={{ min: 18, max: 100 }}
                      helperText="Entre 18 et 100 ans"
                      error={editMode && !profile.age}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Sexe"
                      name="sex"
                      value={profile.sex}
                      onChange={handleChange}
                      disabled={!editMode}
                      required
                      error={editMode && !profile.sex}
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
          <Grid item xs={12}>
            <Card elevation={0} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Work sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Informations Professionnelles
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Niveau d'emploi"
                      name="job"
                      value={profile.job}
                      onChange={handleChange}
                      disabled={!editMode}
                      required
                      error={editMode && profile.job === undefined}
                    >
                      <MenuItem value={0}>0 - Chômeur / Non qualifié non-résident</MenuItem>
                      <MenuItem value={1}>1 - Non qualifié résident</MenuItem>
                      <MenuItem value={2}>2 - Employé qualifié / Fonctionnaire</MenuItem>
                      <MenuItem value={3}>3 - Cadre / Hautement qualifié</MenuItem>
                    </TextField>
                  </Grid>

                  {!editMode && profile.job !== undefined && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>Votre niveau :</strong> {getJobLabel(profile.job)}
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Informations de Logement */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Home sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Informations de Logement
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Type de logement"
                      name="housing"
                      value={profile.housing}
                      onChange={handleChange}
                      disabled={!editMode}
                      required
                      error={editMode && !profile.housing}
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
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Compte épargne"
                      name="saving_accounts"
                      value={profile.saving_accounts}
                      onChange={handleChange}
                      disabled={!editMode}
                    >
                      <MenuItem value="NA">Non renseigné</MenuItem>
                      <MenuItem value="little">Peu (≤ 100 DM)</MenuItem>
                      <MenuItem value="moderate">Modéré (100-500 DM)</MenuItem>
                      <MenuItem value="quite rich">Assez riche (500-1000 DM)</MenuItem>
                      <MenuItem value="rich">Riche ( ≥ 1000 DM)</MenuItem>
                    </TextField>
                    {!editMode && profile.saving_accounts !== 'NA' && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {getAccountLabel(profile.saving_accounts)}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Compte courant"
                      name="checking_account"
                      value={profile.checking_account}
                      onChange={handleChange}
                      disabled={!editMode}
                    >
                      <MenuItem value="NA">Non renseigné</MenuItem>
                      <MenuItem value="little">Peu (≤ 200 DM)</MenuItem>
                      <MenuItem value="moderate">Modéré (200-1000 DM)</MenuItem>
                      <MenuItem value="rich">Riche ( ≥ 1000 DM)</MenuItem>
                    </TextField>
                    {!editMode && profile.checking_account !== 'NA' && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {getAccountLabel(profile.checking_account)}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Conseils */}
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                💡 <strong>Conseil :</strong> Un profil complet et à jour améliore vos chances d'obtenir un crédit. 
                Les comptes épargne et courant bien garnis sont des atouts pour votre demande selon le German Credit Dataset.
              </Typography>
            </Alert>
          </Grid>

          {/* Actions */}
          {editMode && (
            <Grid item xs={12}>
              <Card elevation={0} sx={{ bgcolor: '#f5f5f5', border: 'none' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={saving || !isProfileValid()}
                    sx={{ mr: 2 }}
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer le Profil'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setEditMode(false)}
                  >
                    Annuler
                  </Button>
                  
                  {!isProfileValid() && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      ⚠️ Veuillez remplir tous les champs obligatoires
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default ClientProfile;
// src/components/admin/ClientList.jsx - Corrigé
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  ExitToApp,
  Search,
  ArrowBack,
} from '@mui/icons-material';
import clientService from '../../services/clientService';
import authService from '../../services/authService';

const ClientList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (clients.length > 0) {
      const filtered = clients.filter(client =>
        (client.user_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (client.age?.toString() || '').includes(searchTerm) ||
        (client.sex?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (client.housing?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Chargement des clients...');
      const data = await clientService.getAllClients();
      console.log('✅ Clients chargés:', data);
      setClients(data || []);
      setFilteredClients(data || []);
    } catch (err) {
      console.error('❌ Erreur chargement clients:', err);
      setError(`Erreur lors du chargement des clients: ${err.toString()}`);
      setClients([]);
      setFilteredClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await clientService.deleteClient(id);
        await loadClients();
      } catch (err) {
        setError('Erreur lors de la suppression du client');
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getJobLabel = (job) => {
    const labels = {
      0: 'Chômeur',
      1: 'Non qualifié',
      2: 'Qualifié',
      3: 'Cadre',
    };
    return labels[job] || `Niveau ${job}`;
  };

  const getAccountLabel = (account) => {
    const labels = {
      'little': 'Peu',
      'moderate': 'Moyen',
      'quite rich': 'Assez riche',
      'rich': 'Riche',
      'NA': 'N/A',
    };
    return labels[account] || account;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement des clients...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/admin/dashboard')}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
            BankRisk AI - Gestion des Clients
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {authService.getCurrentUser()}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Clients German Credit Dataset ({filteredClients.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/clients/new')}
          >
            Nouveau Client
          </Button>
        </Box>

        {/* Barre de recherche */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par email, âge, sexe, logement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white' }}><strong>Email</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Âge</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Sexe</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Emploi</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Logement</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Compte Épargne</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Compte Courant</strong></TableCell>
                <TableCell align="right" sx={{ color: 'white' }}><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {searchTerm ? 'Aucun client trouvé pour cette recherche' : 'Aucun client dans la base de données'}
                      </Typography>
                      {!searchTerm && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Importez les données du German Credit Dataset pour commencer
                        </Typography>
                      )}
                      {!searchTerm && (
                        <Button
                          variant="contained"
                          onClick={() => window.location.reload()}
                        >
                          Actualiser
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {client.user_email || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${client.age} ans`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={client.sex === 'male' ? 'Homme' : 'Femme'}
                        size="small"
                        color={client.sex === 'male' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getJobLabel(client.job)}
                        size="small"
                        color="default"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={client.housing === 'own' ? 'Propriétaire' : 
                               client.housing === 'rent' ? 'Locataire' : 'Gratuit'}
                        size="small"
                        color="info"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getAccountLabel(client.saving_accounts)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getAccountLabel(client.checking_account)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/admin/clients/${client.id}`)}
                        title="Voir les détails"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(client.id)}
                        title="Supprimer"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Statistiques */}
        {filteredClients.length > 0 && (
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary">
                Total Clients
              </Typography>
              <Typography variant="h4" color="primary">
                {filteredClients.length}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary">
                Hommes
              </Typography>
              <Typography variant="h4" color="primary">
                {filteredClients.filter(c => c.sex === 'male').length}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary">
                Femmes
              </Typography>
              <Typography variant="h4" color="secondary">
                {filteredClients.filter(c => c.sex === 'female').length}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary">
                Âge Moyen
              </Typography>
              <Typography variant="h4" color="success.main">
                {Math.round(filteredClients.reduce((acc, c) => acc + c.age, 0) / filteredClients.length)}
              </Typography>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ClientList;
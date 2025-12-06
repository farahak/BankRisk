// frontend/src/components/admin/DebugAPI.jsx
import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Refresh, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import clientService from '../../services/clientService';
import authService from '../../services/authService';
import api from '../../services/api';

const DebugAPI = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    auth: null,
    apiConnection: null,
    clients: null,
    applications: null,
  });

  const testAPI = async () => {
    setLoading(true);
    const newResults = {
      auth: null,
      apiConnection: null,
      clients: null,
      applications: null,
    };

    try {
      // 1. Test Auth
      console.log('🧪 Test 1: Vérification Auth');
      const isAuth = authService.isAuthenticated();
      const user = authService.getCurrentUser();
      newResults.auth = {
        success: isAuth,
        data: { isAuth, user, isAdmin: authService.isAdmin() }
      };
      console.log('✅ Auth:', newResults.auth);

      // 2. Test Connexion API
      console.log('🧪 Test 2: Connexion API');
      try {
        const response = await api.get('/clients/');
        newResults.apiConnection = {
          success: true,
          data: { status: response.status, count: response.data?.length || 0 }
        };
        console.log('✅ API Connection:', newResults.apiConnection);
      } catch (err) {
        newResults.apiConnection = {
          success: false,
          error: err.response?.data || err.message
        };
        console.error('❌ API Connection:', newResults.apiConnection);
      }

      // 3. Test getAllClients
      console.log('🧪 Test 3: getAllClients');
      try {
        const clients = await clientService.getAllClients();
        newResults.clients = {
          success: true,
          data: { count: clients.length, sample: clients.slice(0, 3) }
        };
        console.log('✅ Clients:', newResults.clients);
      } catch (err) {
        newResults.clients = {
          success: false,
          error: err.toString()
        };
        console.error('❌ Clients:', newResults.clients);
      }

      // 4. Test getAllApplications
      console.log('🧪 Test 4: getAllApplications');
      try {
        const apps = await clientService.getAllApplications();
        newResults.applications = {
          success: true,
          data: { count: apps.length, sample: apps.slice(0, 3) }
        };
        console.log('✅ Applications:', newResults.applications);
      } catch (err) {
        newResults.applications = {
          success: false,
          error: err.toString()
        };
        console.error('❌ Applications:', newResults.applications);
      }

    } catch (error) {
      console.error('❌ Erreur globale:', error);
    } finally {
      setResults(newResults);
      setLoading(false);
    }
  };

  const TestResult = ({ title, result }) => {
    if (!result) return null;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {result.success ? (
              <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
            ) : (
              <ErrorIcon sx={{ color: 'error.main', mr: 1 }} />
            )}
            <Typography variant="h6">{title}</Typography>
          </Box>
          
          {result.success ? (
            <Alert severity="success">
              <Typography variant="body2">
                <strong>Succès!</strong>
              </Typography>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </Alert>
          ) : (
            <Alert severity="error">
              <Typography variant="body2">
                <strong>Erreur:</strong>
              </Typography>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {JSON.stringify(result.error, null, 2)}
              </pre>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          🔧 Debug API - BankRisk AI
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Testez la connexion à l'API et vérifiez le chargement des données
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
          onClick={testAPI}
          disabled={loading}
          sx={{ mb: 4 }}
        >
          {loading ? 'Test en cours...' : 'Lancer les tests'}
        </Button>

        {Object.keys(results).some(key => results[key]) && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Résultats des Tests
            </Typography>

            <TestResult title="1. Authentification" result={results.auth} />
            <TestResult title="2. Connexion API" result={results.apiConnection} />
            <TestResult title="3. Récupération Clients" result={results.clients} />
            <TestResult title="4. Récupération Applications" result={results.applications} />

            {/* Résumé */}
            <Card sx={{ mt: 4, bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Résumé
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Tests réussis: {Object.values(results).filter(r => r?.success).length}/4
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Tests échoués: {Object.values(results).filter(r => r && !r.success).length}/4
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Instructions */}
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>💡 Conseils de dépannage:</strong>
          </Typography>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Vérifiez que MongoDB est démarré: <code>net start MongoDB</code></li>
            <li>Vérifiez que le backend est lancé sur le port 8000</li>
            <li>Vérifiez que les données sont importées: <code>python check_database.py</code></li>
            <li>Ouvrez la console du navigateur (F12) pour voir les logs détaillés</li>
          </ul>
        </Alert>
      </Paper>
    </Container>
  );
};

export default DebugAPI;
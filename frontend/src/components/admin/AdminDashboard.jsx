// src/components/admin/AdminDashboard.jsx (Corrigé)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Analytics as AnalyticsIcon,
  ExitToApp,
  TrendingUp,
  TrendingDown,
  Pending,
  CheckCircle,
  Cancel,
  Visibility,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import authService from '../../services/authService';
import clientService from '../../services/clientService';

const drawerWidth = 240;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [stats, setStats] = useState({
    totalClients: 0,
    totalApplications: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    goodRisk: 0,
    badRisk: 0,
  });
  
  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const applications = await clientService.getAllApplications();
      const clients = await clientService.getAllClients();
      
      // Calculer les statistiques
      const approved = applications.filter(app => app.status === 'approved').length;
      const pending = applications.filter(app => app.status === 'pending').length;
      const rejected = applications.filter(app => app.status === 'rejected').length;
      const goodRisk = applications.filter(app => app.risk === 'good').length;
      const badRisk = applications.filter(app => app.risk === 'bad').length;

      setStats({
        totalClients: clients.length,
        totalApplications: applications.length,
        approved,
        pending,
        rejected,
        goodRisk,
        badRisk,
      });

      // Applications récentes (5 dernières)
      setRecentApplications(applications.slice(0, 5));
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
    if (view === 'clients') {
      navigate('/admin/clients');
    } else if (view === 'analytics') {
      navigate('/admin/analytics');
    }
  };

  // Données pour le graphique
  const riskData = [
    { name: 'Bon Risque', value: stats.goodRisk },
    { name: 'Mauvais Risque', value: stats.badRisk },
  ];

  const statusData = [
    { name: 'Approuvé', value: stats.approved },
    { name: 'Rejeté', value: stats.rejected },
    { name: 'En attente', value: stats.pending },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>BR</Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              BankRisk AI
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Admin Panel
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      
      <List>
        <ListItem
          button
          selected={currentView === 'dashboard'}
          onClick={() => handleNavigation('dashboard')}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem
          button
          selected={currentView === 'clients'}
          onClick={() => handleNavigation('clients')}
        >
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Clients" />
        </ListItem>

        <ListItem
          button
          selected={currentView === 'analytics'}
          onClick={() => handleNavigation('analytics')}
        >
          <ListItemIcon>
            <AnalyticsIcon />
          </ListItemIcon>
          <ListItemText primary="Analytiques" />
        </ListItem>
      </List>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Tableau de Bord Admin - German Credit Dataset
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {authService.getCurrentUser()}
          </Typography>

          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Toolbar />

        <Container maxWidth="lg">
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* KPIs */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Demandes
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                        {stats.totalApplications}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        German Credit Dataset
                      </Typography>
                    </Box>
                    <AssessmentIcon sx={{ fontSize: 50, color: 'primary.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ bgcolor: '#e8f5e9' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Bon Risque
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: 'success.main' }}>
                        {stats.goodRisk}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {stats.totalApplications > 0 ? ((stats.goodRisk / stats.totalApplications) * 100).toFixed(1) : 0}% du total
                      </Typography>
                    </Box>
                    <TrendingUp sx={{ fontSize: 50, color: 'success.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ bgcolor: '#ffebee' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Mauvais Risque
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: 'error.main' }}>
                        {stats.badRisk}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {stats.totalApplications > 0 ? ((stats.badRisk / stats.totalApplications) * 100).toFixed(1) : 0}% du total
                      </Typography>
                    </Box>
                    <TrendingDown sx={{ fontSize: 50, color: 'error.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ bgcolor: '#fff3cd' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Clients Uniques
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: 'warning.main' }}>
                        {stats.totalClients}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Base de données
                      </Typography>
                    </Box>
                    <PeopleIcon sx={{ fontSize: 50, color: 'warning.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Graphiques */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Distribution des risques */}
            <Grid item xs={12} md={6}>
              <Card elevation={0}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Distribution des Risques
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={riskData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Nombre de demandes" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Statut des demandes */}
            <Grid item xs={12} md={6}>
              <Card elevation={0}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Statut des Demandes
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Nombre" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Demandes récentes */}
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Demandes de Crédit Récentes
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/clients')}
                >
                  Voir Tout
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Client</strong></TableCell>
                      <TableCell><strong>Montant</strong></TableCell>
                      <TableCell><strong>Durée</strong></TableCell>
                      <TableCell><strong>Objectif</strong></TableCell>
                      <TableCell><strong>Risque</strong></TableCell>
                      <TableCell><strong>Statut</strong></TableCell>
                      <TableCell align="right"><strong>Action</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentApplications.map((application) => (
                      <TableRow key={application.id} hover>
                        <TableCell>
                          {application.client?.user_email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {application.credit_amount?.toLocaleString()} €
                        </TableCell>
                        <TableCell>
                          {application.duration} mois
                        </TableCell>
                        <TableCell>
                          {application.purpose}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={application.risk === 'good' ? 'Bon' : 'Mauvais'}
                            color={application.risk === 'good' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={application.status === 'approved' ? 'Approuvé' : 
                                   application.status === 'rejected' ? 'Rejeté' : 'En attente'}
                            color={application.status === 'approved' ? 'success' : 
                                   application.status === 'rejected' ? 'error' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/admin/applications/${application.id}`)}
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
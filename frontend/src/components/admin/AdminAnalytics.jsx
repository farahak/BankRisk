// src/components/admin/AdminAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Grid,
  Card,
  CardContent,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  Assessment,
  TrendingUp,
  TrendingDown,
  People,
  Euro,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import clientService from '../../services/clientService';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('all');
  const [analyticsData, setAnalyticsData] = useState({
    riskDistribution: [],
    purposeDistribution: [],
    ageDistribution: [],
    creditAmountTrends: [],
    monthlyStats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // Simuler des données d'analytiques basées sur German Credit Dataset
      const riskDistribution = [
        { name: 'Bon Risque', value: 700, color: '#10b981' },
        { name: 'Mauvais Risque', value: 300, color: '#ef4444' },
      ];

      const purposeDistribution = [
        { name: 'Voiture', value: 234, amount: 3450000 },
        { name: 'Radio/TV', value: 189, amount: 1200000 },
        { name: 'Meubles', value: 156, amount: 980000 },
        { name: 'Affaires', value: 145, amount: 4500000 },
        { name: 'Éducation', value: 98, amount: 760000 },
        { name: 'Électroménager', value: 87, amount: 450000 },
        { name: 'Réparations', value: 65, amount: 320000 },
        { name: 'Autres', value: 26, amount: 180000 },
      ];

      const ageDistribution = [
        { age: '18-25', count: 120, risk: 0.35 },
        { age: '26-35', count: 280, risk: 0.28 },
        { age: '36-45', count: 250, risk: 0.22 },
        { age: '46-55', count: 180, risk: 0.18 },
        { age: '56+', count: 170, risk: 0.25 },
      ];

      const creditAmountTrends = [
        { month: 'Jan', avgAmount: 4500, count: 85 },
        { month: 'Fév', avgAmount: 5200, count: 92 },
        { month: 'Mar', avgAmount: 4800, count: 78 },
        { month: 'Avr', avgAmount: 6100, count: 105 },
        { month: 'Mai', avgAmount: 5500, count: 88 },
        { month: 'Juin', avgAmount: 6700, count: 112 },
      ];

      const monthlyStats = [
        { metric: 'Taux d\'approbation', value: '69.5%', trend: '+2.1%' },
        { metric: 'Montant moyen', value: '5,432€', trend: '+5.8%' },
        { metric: 'Durée moyenne', value: '24 mois', trend: '-1.2%' },
        { metric: 'Score risque moyen', value: '34.2%', trend: '-3.4%' },
      ];

      setAnalyticsData({
        riskDistribution,
        purposeDistribution,
        ageDistribution,
        creditAmountTrends,
        monthlyStats,
      });
    } catch (error) {
      console.error('Erreur analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" color={entry.color}>
              {entry.name}: {entry.value.toLocaleString()}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

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
            Analytics & Rapports
          </Typography>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120, bgcolor: 'white' }}>
            <InputLabel>Période</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Période"
            >
              <MenuItem value="week">7 jours</MenuItem>
              <MenuItem value="month">30 jours</MenuItem>
              <MenuItem value="quarter">Trimestre</MenuItem>
              <MenuItem value="all">Tout</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Métriques principales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {analyticsData.monthlyStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={0}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      {stat.metric}
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={stat.trend.startsWith('+') ? 'success.main' : 'error.main'}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    {stat.trend.startsWith('+') ? <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} /> : <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />}
                    {stat.trend}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Distribution des risques */}
          <Grid item xs={12} md={6}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Distribution des Risques
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${((value / 1000) * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Distribution par âge */}
          <Grid item xs={12} md={6}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Répartition par Âge
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.ageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="count" name="Nombre de demandes" fill="#3b82f6" />
                    <Bar dataKey="risk" name="Taux de risque" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Objectif des crédits */}
          <Grid item xs={12} lg={8}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Demandes par Objectif
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData.purposeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="value" name="Nombre de demandes" fill="#10b981" />
                    <Bar yAxisId="right" dataKey="amount" name="Montant total (k€)" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Tendance des montants */}
          <Grid item xs={12} lg={4}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Évolution des Montants
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analyticsData.creditAmountTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="avgAmount" 
                      name="Montant moyen (€)" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="Nombre de demandes" 
                      stroke="#10b981" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistiques détaillées */}
          <Grid item xs={12}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Insights du German Credit Dataset
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">1,000</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Demandes analysées
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">70%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Taux d'approbation
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Euro sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">4,320€</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Montant moyen
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminAnalytics;
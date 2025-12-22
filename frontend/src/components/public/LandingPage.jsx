import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    AppBar,
    Toolbar,
    Stack,
    useTheme,
    IconButton,
} from '@mui/material';
import {
    Speed,
    Security,
    Insights,
    AccountBalance,
    Menu,
} from '@mui/icons-material';

const LandingPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const services = [
        {
            title: 'Évaluation de Risque IA',
            description: 'Analyse instantanée de votre profil de crédit basée sur des algorithmes de machine learning avancés.',
            icon: <Speed sx={{ fontSize: 40, color: 'primary.main' }} />,
        },
        {
            title: 'Sécurité Bancaire',
            description: 'Vos données sont protégées par les plus hauts standards de chiffrement et conformes au RGPD.',
            icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
        },
        {
            title: 'Insights Décisionnels',
            description: 'Comprenez les facteurs qui influencent votre score de crédit avec notre IA explicable.',
            icon: <Insights sx={{ fontSize: 40, color: 'primary.main' }} />,
        },
    ];

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* Navigation */}
            <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                            <AccountBalance sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
                            <Typography
                                variant="h6"
                                noWrap
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing: '.1rem',
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                }}
                            >
                                BTK <span style={{ color: '#333' }}>BankRisk</span>
                            </Typography>
                        </Box>

                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, mr: 4 }}>
                            <Button color="inherit">Particuliers</Button>
                            <Button color="inherit">Professionnels</Button>
                            <Button color="inherit">À propos</Button>
                        </Box>

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => navigate('/login')}
                            >
                                Espace Client
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate('/register')}
                            >
                                Ouvrir un compte
                            </Button>
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Hero Section */}
            <Box
                sx={{
                    pt: 12,
                    pb: 12,
                    background: 'linear-gradient(135deg, #136DA5 0%, #0F5682 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Typography variant="h2" gutterBottom sx={{ fontWeight: 800 }}>
                                L'intelligence artificielle au service de votre crédit
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}>
                                Évaluez votre capacité d'emprunt en quelques minutes avec notre système expert basé sur le German Credit Dataset.
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        '&:hover': { bgcolor: '#f0f0f0' },
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem'
                                    }}
                                    onClick={() => navigate('/register')}
                                >
                                    Commencer l'évaluation
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        color: 'white',
                                        borderColor: 'white',
                                        '&:hover': { borderColor: '#f0f0f0', bgcolor: 'rgba(255,255,255,0.1)' },
                                        px: 4
                                    }}
                                >
                                    Voir nos offres
                                </Button>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Box
                                component="img"
                                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                                alt="Fintech IA"
                                sx={{
                                    width: '100%',
                                    borderRadius: 4,
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                }}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Services Section */}
            <Container maxWidth="lg" sx={{ py: 12 }}>
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="h3" gutterBottom sx={{ color: 'primary.main' }}>
                        Pourquoi choisir BTK BankRisk ?
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Une approche innovante pour une gestion de crédit transparente et efficace.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {services.map((service, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Card
                                elevation={0}
                                className="btk-card"
                                sx={{
                                    height: '100%',
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'white'
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ mb: 2 }}>
                                        {service.icon}
                                    </Box>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                                        {service.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                        {service.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Footer */}
            <Box sx={{ bgcolor: '#333', color: 'white', py: 6, mt: 8 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>
                                BTK BankRisk AI
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                Propulsé par les technologies de pointe en data science pour une banque plus juste et plus rapide.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                &copy; {new Date().getFullYear()} BTK Bank. Tous droits réservés.
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;

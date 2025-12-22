// frontend/src/components/client/ClientMessages.jsx
import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Chip,
    Badge,
    Paper,
    Divider,
    Button,
    TextField,
    Stack,
    IconButton,
} from '@mui/material';
import {
    Message as MessageIcon,
    Send,
    AttachFile,
    Download,
    ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import clientService from '../../services/clientService';
import authService from '../../services/authService';

const ClientMessages = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sending, setSending] = useState(false);

    const [replyContent, setReplyContent] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        console.log('📱 ClientMessages: Loading applications...');
        try {
            setLoading(true);
            const userEmail = authService.getCurrentUser();
            console.log('📧 User email from authService:', userEmail);

            if (!userEmail) {
                console.error('❌ No user email found! User might not be logged in.');
                setError('Erreur: utilisateur non connecté');
                setLoading(false);
                return;
            }

            const apps = await clientService.getApplicationsByUserEmail(userEmail);
            console.log('📊 Applications received:', apps);
            console.log('📊 Number of applications:', apps?.length);

            setApplications(apps);
            console.log('✅ Applications state updated');
        } catch (err) {
            console.error('❌ Error loading applications:', err);
            setError('Erreur lors du chargement des demandes');
        } finally {
            setLoading(false);
        }
    };

    const loadConversation = async (appId) => {
        console.log('🔍 Loading conversation for app:', appId);
        try {
            const msgs = await clientService.getConversation(appId);
            console.log('✅ Messages loaded:', msgs);
            setMessages(msgs);
            setSelectedApp(appId);
        } catch (err) {
            console.error('❌ Error loading conversation:', err);
            setError('Erreur lors du chargement de la conversation: ' + (err.message || err));
        }
    };

    const handleSendReply = async () => {
        if (!replyContent.trim()) {
            setError('Le message ne peut pas être vide');
            return;
        }

        try {
            setSending(true);
            setError('');

            await clientService.sendMessage(
                {
                    application_id: selectedApp,
                    content: replyContent,
                },
                selectedFiles
            );

            setSuccess('Message envoyé!');
            setReplyContent('');
            setSelectedFiles([]);

            // Recharger la conversation
            await loadConversation(selectedApp);

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erreur lors de l\'envoi');
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        const validFiles = files.filter(file => {
            if (!file.name.endsWith('.pdf')) {
                setError('Seuls les fichiers PDF sont autorisés');
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Fichier trop volumineux (max 5MB)');
                return false;
            }
            return true;
        });
        setSelectedFiles([...selectedFiles, ...validFiles]);
    };

    const handleDownload = async (attachment) => {
        try {
            await clientService.downloadAttachment(attachment.id, attachment.filename);
        } catch (err) {
            setError('Erreur lors du téléchargement');
        }
    };

    const getUnreadCount = (appId) => {
        // Pour l'instant, retourne 0 (à améliorer avec un vrai compteur)
        return 0;
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/client/dashboard')}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h4" sx={{ ml: 2, fontWeight: 'bold' }}>
                    💬 Mes Messages
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {!selectedApp ? (
                // Liste des demandes avec messages
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Sélectionnez une demande pour voir les messages
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        {applications.length === 0 ? (
                            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                Aucune demande de crédit
                            </Typography>
                        ) : (
                            <List>
                                {applications.map((app) => (
                                    <ListItem
                                        key={app.id}
                                        disablePadding
                                        sx={{
                                            border: '1px solid #e0e0e0',
                                            borderRadius: 2,
                                            mb: 1,
                                        }}
                                    >
                                        <Box
                                            onClick={() => loadConversation(app.id)}
                                            sx={{
                                                width: '100%',
                                                p: 2,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                '&:hover': { bgcolor: '#f5f5f5' }
                                            }}
                                        >
                                            <ListItemText
                                                primary={`Demande de ${app.credit_amount}€ - ${app.duration} mois`}
                                                secondary={`Statut: ${app.status} | Soumise le ${new Date(app.submission_date).toLocaleDateString()}`}
                                            />
                                            <Badge badgeContent={getUnreadCount(app.id)} color="primary">
                                                <MessageIcon />
                                            </Badge>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>
            ) : (
                // Conversation
                <Box>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => setSelectedApp(null)}
                        sx={{ mb: 2 }}
                    >
                        Retour aux demandes
                    </Button>

                    {/* Messages */}
                    <Card sx={{ mb: 3, maxHeight: 500, overflow: 'auto' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Conversation
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {messages.length === 0 ? (
                                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                    Aucun message
                                </Typography>
                            ) : (
                                <Stack spacing={2}>
                                    {messages.map((msg) => (
                                        <Paper
                                            key={msg.id}
                                            elevation={1}
                                            sx={{
                                                p: 2,
                                                bgcolor: msg.sender_type === 'client' ? '#e3f2fd' : '#f5f5f5',
                                                borderLeft: `4px solid ${msg.sender_type === 'client' ? '#1976d2' : '#757575'}`,
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                    {msg.sender_type === 'admin' ? '🔷 BankRisk' : '👤 Vous'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(msg.created_at).toLocaleString('fr-FR')}
                                                </Typography>
                                            </Box>

                                            {msg.subject && (
                                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                                    {msg.subject}
                                                </Typography>
                                            )}

                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {msg.content}
                                            </Typography>

                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <Box sx={{ mt: 2 }}>
                                                    {msg.attachments.map((att) => (
                                                        <Chip
                                                            key={att.id}
                                                            label={`📎 ${att.filename} (${att.file_size_display})`}
                                                            onClick={() => handleDownload(att)}
                                                            onDelete={() => handleDownload(att)}
                                                            deleteIcon={<Download />}
                                                            sx={{ mr: 1, mb: 1 }}
                                                            size="small"
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        </Paper>
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>

                    {/* Répondre */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Répondre
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Votre message"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Écrivez votre réponse..."
                                />

                                <Box>
                                    <input
                                        accept=".pdf"
                                        style={{ display: 'none' }}
                                        id="file-upload-client"
                                        type="file"
                                        multiple
                                        onChange={handleFileSelect}
                                    />
                                    <label htmlFor="file-upload-client">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<AttachFile />}
                                            size="small"
                                        >
                                            Joindre PDF
                                        </Button>
                                    </label>

                                    {selectedFiles.length > 0 && (
                                        <Box sx={{ mt: 1 }}>
                                            {selectedFiles.map((file, index) => (
                                                <Chip
                                                    key={index}
                                                    label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                                                    onDelete={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                                                    sx={{ mr: 1, mb: 1 }}
                                                    size="small"
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </Box>

                                <Button
                                    variant="contained"
                                    startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                    onClick={handleSendReply}
                                    disabled={sending || !replyContent.trim()}
                                    fullWidth
                                >
                                    {sending ? 'Envoi...' : 'Envoyer'}
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Container>
    );
};

export default ClientMessages;

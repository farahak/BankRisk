// frontend/src/components/admin/MessageThread.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Stack,
    Chip,
    IconButton,
    Alert,
    CircularProgress,
    Paper,
    Divider,
} from '@mui/material';
import {
    Send,
    AttachFile,
    Download,
    Delete,
    Message as MessageIcon,
} from '@mui/icons-material';
import clientService from '../../services/clientService';

const MessageThread = ({ applicationId }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [newMessage, setNewMessage] = useState({
        subject: '',
        content: '',
    });
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        if (applicationId) {
            loadConversation();
        }
    }, [applicationId]);

    const loadConversation = async () => {
        try {
            setLoading(true);
            const data = await clientService.getConversation(applicationId);
            setMessages(data);
        } catch (err) {
            setError('Erreur lors du chargement de la conversation');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);

        // Valider les fichiers
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

    const removeFile = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleSendMessage = async () => {
        if (!newMessage.content.trim()) {
            setError('Le message ne peut pas être vide');
            return;
        }

        try {
            setSending(true);
            setError('');

            await clientService.sendMessage(
                {
                    application_id: applicationId,
                    subject: newMessage.subject,
                    content: newMessage.content,
                },
                selectedFiles
            );

            setSuccess('Message envoyé avec succès!');
            setNewMessage({ subject: '', content: '' });
            setSelectedFiles([]);

            // Recharger la conversation
            await loadConversation();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'envoi du message');
        } finally {
            setSending(false);
        }
    };

    const handleDownload = async (attachment) => {
        try {
            await clientService.downloadAttachment(attachment.id, attachment.filename);
        } catch (err) {
            setError('Erreur lors du téléchargement');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
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

            {/* Conversation Thread */}
            <Card elevation={0} sx={{ mb: 3, maxHeight: 500, overflow: 'auto' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <MessageIcon sx={{ mr: 1 }} />
                        Conversation ({messages.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {messages.length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            Aucun message pour le moment
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {messages.map((msg) => (
                                <Paper
                                    key={msg.id}
                                    elevation={1}
                                    sx={{
                                        p: 2,
                                        bgcolor: msg.sender_type === 'admin' ? '#e3f2fd' : '#f5f5f5',
                                        borderLeft: `4px solid ${msg.sender_type === 'admin' ? '#1976d2' : '#757575'}`,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                            {msg.sender_type === 'admin' ? '🔷 Admin' : '👤 Client'}
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

            {/* Message Composer */}
            <Card elevation={0}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Nouveau Message
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            label="Sujet (optionnel)"
                            value={newMessage.subject}
                            onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                            size="small"
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Message *"
                            value={newMessage.content}
                            onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                            placeholder="Écrivez votre message ici..."
                        />

                        {/* File Upload */}
                        <Box>
                            <input
                                accept=".pdf"
                                style={{ display: 'none' }}
                                id="file-upload"
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                            />
                            <label htmlFor="file-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<AttachFile />}
                                    size="small"
                                >
                                    Joindre PDF (max 5MB)
                                </Button>
                            </label>

                            {selectedFiles.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                    {selectedFiles.map((file, index) => (
                                        <Chip
                                            key={index}
                                            label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                                            onDelete={() => removeFile(index)}
                                            deleteIcon={<Delete />}
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
                            onClick={handleSendMessage}
                            disabled={sending || !newMessage.content.trim()}
                            fullWidth
                        >
                            {sending ? 'Envoi...' : 'Envoyer le message'}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default MessageThread;

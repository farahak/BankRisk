// frontend/src/services/clientService.js
import api from './api';

const clientService = {
  // ============ CLIENTS ============

  // Récupérer tous les clients
  getAllClients: async () => {
    try {
      const response = await api.get('/clients/');
      console.log('📊 Clients récupérés:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAllClients:', error);
      throw error.response?.data || error.message;
    }
  },

  // Récupérer un client par ID
  getClientById: async (id) => {
    try {
      const response = await api.get(`/clients/${id}/`);
      console.log('📊 Client récupéré:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getClientById:', error);
      throw error.response?.data || error.message;
    }
  },

  // Récupérer un client par email
  getClientByEmail: async (email) => {
    try {
      const response = await api.get(`/clients/by_email/?email=${email}`);
      console.log('📊 Client par email récupéré:', response.data);
      return response.data;
    } catch (error) {
      // Retourner null si le client n'existe pas
      if (error.response?.status === 404) {
        console.log('ℹ️  Aucun client trouvé pour:', email);
        return null;
      }
      console.error('❌ Erreur getClientByEmail:', error);
      throw error.response?.data || error.message;
    }
  },

  // Créer un nouveau client
  createClient: async (clientData) => {
    try {
      console.log('📤 Création du client:', clientData);
      const response = await api.post('/clients/', clientData);
      console.log('✅ Client créé:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur createClient:', error.response?.data || error);
      throw error.response?.data || error.message;
    }
  },

  // Mettre à jour un client
  updateClient: async (id, clientData) => {
    try {
      console.log('📤 Mise à jour du client:', id, clientData);
      const response = await api.put(`/clients/${id}/`, clientData);
      console.log('✅ Client mis à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updateClient:', error);
      throw error.response?.data || error.message;
    }
  },

  // Supprimer un client
  deleteClient: async (id) => {
    try {
      console.log('🗑️  Suppression du client:', id);
      await api.delete(`/clients/${id}/`);
      console.log('✅ Client supprimé');
    } catch (error) {
      console.error('❌ Erreur deleteClient:', error);
      throw error.response?.data || error.message;
    }
  },

  // ============ DEMANDES DE CRÉDIT ============

  // Récupérer toutes les applications
  getAllApplications: async () => {
    try {
      const response = await api.get('/applications/');
      console.log('📊 Applications récupérées:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAllApplications:', error);
      throw error.response?.data || error.message;
    }
  },

  // Récupérer une application par ID
  getApplicationById: async (id) => {
    try {
      const response = await api.get(`/applications/${id}/`);
      console.log('📊 Application récupérée:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getApplicationById:', error);
      throw error.response?.data || error.message;
    }
  },

  // Récupérer les applications d'un client
  getApplicationsByClient: async (clientId) => {
    try {
      const response = await api.get(`/applications/by_client/?client_id=${clientId}`);
      console.log('📊 Applications du client récupérées:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getApplicationsByClient:', error);
      throw error.response?.data || error.message;
    }
  },

  // Récupérer les applications par email utilisateur
  getApplicationsByUserEmail: async (userEmail) => {
    try {
      console.log('🔍 Recherche des applications pour:', userEmail);
      // D'abord récupérer le client par email
      const client = await clientService.getClientByEmail(userEmail);
      if (!client) {
        console.log('ℹ️  Aucun client trouvé, retour []');
        return [];
      }
      // Puis récupérer ses applications
      const applications = await clientService.getApplicationsByClient(client.id);
      console.log('✅ Applications trouvées:', applications.length);
      return applications;
    } catch (error) {
      console.error('❌ Erreur getApplicationsByUserEmail:', error);
      return [];
    }
  },

  // Soumettre une nouvelle demande de crédit
  submitCreditApplication: async (applicationData) => {
    const response = await api.post('/applications/', applicationData);
    return response.data;
  },

  // Estimer le taux d'intérêt en temps réel
  estimateInterestRate: async (data) => {
    const response = await api.post('/applications/estimate_interest/', data);
    return response.data;
  },

  // Évaluer une demande (Admin)
  evaluateApplication: async (id, evaluationData) => {
    try {
      console.log('📤 Évaluation de la demande:', id, evaluationData);
      const response = await api.post(`/applications/${id}/evaluate/`, evaluationData);
      console.log('✅ Demande évaluée:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur evaluateApplication:', error);
      throw error.response?.data || error.message;
    }
  },

  // Supprimer une application
  deleteApplication: async (id) => {
    try {
      console.log('🗑️  Suppression de l\'application:', id);
      await api.delete(`/applications/${id}/`);
      console.log('✅ Application supprimée');
    } catch (error) {
      console.error('❌ Erreur deleteApplication:', error);
      throw error.response?.data || error.message;
    }
  },

  // ============ STATISTIQUES (pour Admin) ============

  // Obtenir les statistiques du dashboard (optimisé)
  getDashboardStats: async () => {
    try {
      const response = await api.get('/stats/dashboard/');
      console.log('📊 Statistiques du dashboard récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getDashboardStats:', error);
      throw error.response?.data || error.message;
    }
  },

  // ============ MESSAGERIE ============

  // Récupérer la conversation pour une demande
  getConversation: async (applicationId) => {
    try {
      const response = await api.get(`/messages/conversation/${applicationId}/`);
      console.log('💬 Conversation récupérée:', response.data.length, 'messages');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getConversation:', error);
      throw error.response?.data || error.message;
    }
  },

  // Envoyer un nouveau message avec pièces jointes
  sendMessage: async (messageData, files = []) => {
    try {
      const formData = new FormData();
      formData.append('application_id', messageData.application_id);
      formData.append('subject', messageData.subject || '');
      formData.append('content', messageData.content);

      if (messageData.parent_message_id) {
        formData.append('parent_message_id', messageData.parent_message_id);
      }

      // Ajouter les fichiers
      files.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await api.post('/messages/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('✅ Message envoyé:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur sendMessage:', error);
      throw error.response?.data || error.message;
    }
  },

  // Répondre à un message
  replyToMessage: async (messageId, content, files = []) => {
    try {
      const formData = new FormData();
      formData.append('content', content);

      files.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await api.post(`/messages/${messageId}/reply/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('✅ Réponse envoyée:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur replyToMessage:', error);
      throw error.response?.data || error.message;
    }
  },

  // Marquer un message comme lu
  markMessageAsRead: async (messageId) => {
    try {
      const response = await api.patch(`/messages/${messageId}/mark_read/`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur markMessageAsRead:', error);
      throw error.response?.data || error.message;
    }
  },

  // Compter les messages non lus
  getUnreadCount: async () => {
    try {
      const response = await api.get('/messages/unread_count/');
      return response.data.unread_count || 0;
    } catch (error) {
      console.error('❌ Erreur getUnreadCount:', error);
      return 0;
    }
  },

  // Télécharger une pièce jointe
  downloadAttachment: async (attachmentId, filename) => {
    try {
      const response = await api.get(`/attachments/${attachmentId}/download/`, {
        responseType: 'blob'
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log('✅ Fichier téléchargé:', filename);
    } catch (error) {
      console.error('❌ Erreur downloadAttachment:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default clientService;
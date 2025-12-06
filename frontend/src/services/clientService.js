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
    try {
      console.log('📤 Soumission de la demande:', applicationData);
      const response = await api.post('/applications/', applicationData);
      console.log('✅ Demande soumise:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur submitCreditApplication:', error.response?.data || error);
      throw error.response?.data || error.message;
    }
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

  // Obtenir les statistiques du dashboard
  getDashboardStats: async () => {
    try {
      const [clients, applications] = await Promise.all([
        clientService.getAllClients(),
        clientService.getAllApplications()
      ]);

      const stats = {
        totalClients: clients.length,
        totalApplications: applications.length,
        approved: applications.filter(app => app.status === 'approved').length,
        pending: applications.filter(app => app.status === 'pending').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        riskGood: applications.filter(app => app.risk === 'good').length,
        riskBad: applications.filter(app => app.risk === 'bad').length,
      };

      console.log('📊 Statistiques:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erreur getDashboardStats:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default clientService;
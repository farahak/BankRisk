// frontend/src/services/authService.js
import api from './api';

const authService = {
  // Inscription
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  // Connexion
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    const { access, refresh, user } = response.data;

    // Stocker les tokens et informations utilisateur
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('user_email', user.email);
    localStorage.setItem('user_first_name', user.first_name || '');
    localStorage.setItem('user_last_name', user.last_name || '');
    localStorage.setItem('is_staff', user.is_staff.toString());

    return response.data;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_first_name');
    localStorage.removeItem('user_last_name');
    localStorage.removeItem('is_staff');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Vérifier si l'utilisateur est admin
  isAdmin: () => {
    return localStorage.getItem('is_staff') === 'true';
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: () => {
    return localStorage.getItem('user_email');
  },

  // Obtenir le nom complet de l'utilisateur
  getCurrentUserFullName: () => {
    const firstName = localStorage.getItem('user_first_name') || '';
    const lastName = localStorage.getItem('user_last_name') || '';
    return `${firstName} ${lastName}`.trim() || localStorage.getItem('user_email');
  },

  // Obtenir l'ID de l'utilisateur
  getCurrentUserId: () => {
    return localStorage.getItem('user_id');
  },

  // Obtenir le token d'accès
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },
};

export default authService;
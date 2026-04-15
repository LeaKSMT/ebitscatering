import { apiClient } from '../utils/api.js';

export const authService = {
  async login(email, password) {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });
      
      if (response.token) {
        apiClient.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      
      if (response.token) {
        apiClient.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.setToken(null);
      localStorage.removeItem('user');
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!apiClient.token && !!localStorage.getItem('user');
  },

  async checkAuth() {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response.user;
    } catch (error) {
      this.logout();
      return null;
    }
  }
};

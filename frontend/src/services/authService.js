import { apiClient } from "../utils/api.js";

export const authService = {
  async login(email, password) {
    const response = await apiClient.post("/api/auth/login", {
      email,
      password,
    });

    if (response.token) {
      apiClient.setToken(response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  },

  async register(userData) {
    const response = await apiClient.post("/api/auth/register", userData);

    if (response.token) {
      apiClient.setToken(response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  },

  async logout() {
    apiClient.setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("clientUser");
    localStorage.removeItem("clientName");
    localStorage.removeItem("clientEmail");
    localStorage.removeItem("currentClientName");
    localStorage.removeItem("currentClientEmail");
    localStorage.removeItem("isClientLoggedIn");
    localStorage.removeItem("adminAuth");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!apiClient.token && !!localStorage.getItem("user");
  },

  async checkAuth() {
    try {
      return await apiClient.get("/api/auth/me");
    } catch (error) {
      this.logout();
      return null;
    }
  },
};
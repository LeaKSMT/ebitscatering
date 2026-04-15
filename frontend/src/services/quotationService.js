import { apiClient } from '../utils/api.js';

export const quotationService = {
  async getAllQuotations() {
    try {
      const response = await apiClient.get('/api/quotations');
      return response.quotations || [];
    } catch (error) {
      console.error('Error fetching quotations:', error);
      throw error;
    }
  },

  async getQuotationById(id) {
    try {
      const response = await apiClient.get(`/api/quotations/${id}`);
      return response.quotation;
    } catch (error) {
      console.error('Error fetching quotation:', error);
      throw error;
    }
  },

  async createQuotation(quotationData) {
    try {
      const response = await apiClient.post('/api/quotations', quotationData);
      return response.quotation;
    } catch (error) {
      console.error('Error creating quotation:', error);
      throw error;
    }
  },

  async updateQuotation(id, quotationData) {
    try {
      const response = await apiClient.put(`/api/quotations/${id}`, quotationData);
      return response.quotation;
    } catch (error) {
      console.error('Error updating quotation:', error);
      throw error;
    }
  },

  async deleteQuotation(id) {
    try {
      const response = await apiClient.delete(`/api/quotations/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting quotation:', error);
      throw error;
    }
  },

  async getQuotationsByClient(clientEmail) {
    try {
      const response = await apiClient.get(`/api/quotations/client/${clientEmail}`);
      return response.quotations || [];
    } catch (error) {
      console.error('Error fetching client quotations:', error);
      throw error;
    }
  },

  async convertToBooking(quotationId) {
    try {
      const response = await apiClient.post(`/api/quotations/${quotationId}/convert`);
      return response.booking;
    } catch (error) {
      console.error('Error converting quotation to booking:', error);
      throw error;
    }
  }
};

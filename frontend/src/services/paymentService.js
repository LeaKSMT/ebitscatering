import { apiClient } from '../utils/api.js';

export const paymentService = {
  async getAllPayments() {
    try {
      const response = await apiClient.get('/api/payments');
      return response.payments || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  async getPaymentById(id) {
    try {
      const response = await apiClient.get(`/api/payments/${id}`);
      return response.payment;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  async createPayment(paymentData) {
    try {
      const response = await apiClient.post('/api/payments', paymentData);
      return response.payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  async updatePayment(id, paymentData) {
    try {
      const response = await apiClient.put(`/api/payments/${id}`, paymentData);
      return response.payment;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  },

  async deletePayment(id) {
    try {
      const response = await apiClient.delete(`/api/payments/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  },

  async getPaymentsByBooking(bookingId) {
    try {
      const response = await apiClient.get(`/api/payments/booking/${bookingId}`);
      return response.payments || [];
    } catch (error) {
      console.error('Error fetching booking payments:', error);
      throw error;
    }
  },

  async getPaymentsByClient(clientEmail) {
    try {
      const response = await apiClient.get(`/api/payments/client/${clientEmail}`);
      return response.payments || [];
    } catch (error) {
      console.error('Error fetching client payments:', error);
      throw error;
    }
  }
};

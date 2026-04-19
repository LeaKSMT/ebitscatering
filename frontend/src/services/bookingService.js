import { apiClient } from '../utils/api.js';

export const bookingService = {
  async getAllBookings() {
    try {
      const response = await apiClient.get('/api/bookings');
      return response; // ✅ backend returns array directly
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  async getBookingById(id) {
    try {
      const response = await apiClient.get(`/api/bookings/${id}`);
      return response; // ✅ single object
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  },

  async createBooking(bookingData) {
    try {
      const response = await apiClient.post('/api/bookings', bookingData);
      return response; // ✅ { message, id }
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  async updateBooking(id, bookingData) {
    try {
      const response = await apiClient.put(`/api/bookings/${id}`, bookingData);
      return response;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  async deleteBooking(id) {
    try {
      const response = await apiClient.delete(`/api/bookings/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }
};
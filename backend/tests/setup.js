const request = require('supertest');
const app = require('../server');

// Test database setup - use test database
process.env.DB_NAME = 'ebits_catering_test_db';

// Global test setup
beforeAll(async () => {
  // You can add test database setup here if needed
  console.log('Setting up test environment...');
});

afterAll(async () => {
  // Cleanup test database if needed
  console.log('Cleaning up test environment...');
});

// Export configured app for testing
module.exports = {
  app,
  request
};

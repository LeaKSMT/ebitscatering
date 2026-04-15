const { app, request } = require('./setup');

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/login', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ 
          email: 'nonexistent@example.com',
          password: 'wrongpassword' 
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 200 and token for valid credentials', async () => {
      // This test assumes a test user exists
      const response = await request(app)
        .post('/api/auth/login')
        .send({ 
          email: 'owner@ebitscatering.com',
          password: 'ebitscatering000' 
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'owner@ebitscatering.com');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/auth/me');
      
      expect(response.status).toBe(401);
    });

    it('should return user data for authenticated request', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ 
          email: 'owner@ebitscatering.com',
          password: 'ebitscatering000' 
        });
      
      const token = loginResponse.body.token;
      
      // Then test authenticated endpoint
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'owner@ebitscatering.com');
    });
  });
});

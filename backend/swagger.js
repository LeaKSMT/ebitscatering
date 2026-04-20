const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ebits Catering API',
      version: '1.0.0',
      description: 'A comprehensive catering management system API',
      contact: {
        name: 'Ebits Catering Support',
        email: 'support@ebitscatering.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://ebitscatering-production.up.railway.app/api'
          : 'http://localhost:5000/api',
        description: process.env.NODE_ENV === 'production'
          ? 'Production server'
          : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            id: { type: 'integer', description: 'User ID' },
            name: { type: 'string', description: 'User name' },
            email: { type: 'string', format: 'email', description: 'User email' },
            role: { type: 'string', enum: ['admin', 'client'], description: 'User role' },
            created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' }
          }
        },
        Booking: {
          type: 'object',
          required: ['eventType', 'eventDate', 'venue', 'guestCount'],
          properties: {
            id: { type: 'integer', description: 'Booking ID' },
            bookingId: { type: 'string', description: 'Booking reference number' },
            eventType: { type: 'string', description: 'Type of event' },
            eventDate: { type: 'string', format: 'date', description: 'Event date' },
            eventTime: { type: 'string', description: 'Event time' },
            venue: { type: 'string', description: 'Event venue' },
            guestCount: { type: 'integer', description: 'Number of guests' },
            packageType: { type: 'string', description: 'Selected package type' },
            totalAmount: { type: 'number', description: 'Total amount' },
            paymentStatus: { type: 'string', enum: ['paid', 'unpaid', 'partial'], description: 'Payment status' },
            status: { type: 'string', enum: ['confirmed', 'pending', 'cancelled'], description: 'Booking status' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' }
          }
        },
        Quotation: {
          type: 'object',
          required: ['eventType', 'preferredDate', 'guests'],
          properties: {
            id: { type: 'integer', description: 'Quotation ID' },
            quotationId: { type: 'string', description: 'Quotation reference number' },
            fullName: { type: 'string', description: 'Client full name' },
            email: { type: 'string', format: 'email', description: 'Client email' },
            contactNumber: { type: 'string', description: 'Client contact number' },
            eventType: { type: 'string', description: 'Type of event' },
            preferredDate: { type: 'string', format: 'date', description: 'Preferred event date' },
            guests: { type: 'integer', description: 'Number of guests' },
            venue: { type: 'string', description: 'Event venue' },
            packageType: { type: 'string', description: 'Selected package type' },
            estimatedTotal: { type: 'number', description: 'Estimated total cost' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], description: 'Quotation status' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' }
          }
        },
        Payment: {
          type: 'object',
          required: ['bookingId', 'amount', 'paymentMethod'],
          properties: {
            id: { type: 'integer', description: 'Payment ID' },
            paymentId: { type: 'string', description: 'Payment reference number' },
            bookingId: { type: 'string', description: 'Associated booking ID' },
            clientName: { type: 'string', description: 'Client name' },
            paymentType: { type: 'string', description: 'Payment type' },
            paymentMethod: { type: 'string', enum: ['cash', 'bank', 'gcash', 'paypal'], description: 'Payment method' },
            amount: { type: 'number', description: 'Payment amount' },
            referenceNumber: { type: 'string', description: 'Transaction reference number' },
            createdAt: { type: 'string', format: 'date-time', description: 'Payment timestamp' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', description: 'Error message' },
            stack: { type: 'string', description: 'Error stack trace (development only)' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', description: 'Success message' },
            data: { type: 'object', description: 'Response data' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./controllers/*.js', './routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};
